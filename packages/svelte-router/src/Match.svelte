<script lang="ts">
  import { setContext } from 'svelte'
  import { isNotFound, rootRouteId } from '@tanstack/router-core'
  import { isServer } from '@tanstack/router-core/isServer'
  import type {
    AnyRoute,
    AnyRouteMatch,
    AnyRouter,
  } from '@tanstack/router-core'
  import { isSnippet, toError, useRouterSelector } from './utils.js'
  import { useRouter } from './useRouter.js'
  import {
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext.js'
  import Outlet from './Outlet.svelte'
  import ErrorComponent from './ErrorComponent.svelte'
  import ErrorBubbler from './ErrorBubbler.svelte'
  import RouteNotFound from './RouteNotFound.svelte'
  import ClientOnly from './ClientOnly.svelte'
  import ScrollRestoration from './ScrollRestoration.svelte'
  import NonRouteComponentContext from './NonRouteComponentContext.svelte'
  import type { Component, Snippet } from 'svelte'

  let { routeId }: { routeId: string } = $props()

  const router = useRouter<AnyRouter>()

  // One stable store per route id: it stays in router-core's pool while the
  // route is out of the tree and holds `undefined` until it re-enters. The
  // read is a `$derived` (not `$state` written from an `$effect`) so the
  // component swap happens in the same pass as the id change — an effect
  // runs a full render late, during which the outgoing component's selectors
  // would already resolve to `undefined`. It also works on the server, where
  // `$effect` never runs.
  // svelte-ignore state_referenced_locally
  const matchSel = useRouterSelector(
    router,
    router.stores.getMatchStore(routeId),
  )
  const match = $derived(matchSel.current as AnyRouteMatch | undefined)
  const route = $derived(router.routesById[routeId] as AnyRoute | undefined)

  const nearestMatch: NearestMatchContextValue = {
    routeId: () => routeId,
    match: () => match,
  }
  setContext(nearestMatchContextKey, nearestMatch)

  const component = $derived(
    route?.options.component ?? router.options.defaultComponent,
  )
  const pendingComponent = $derived(
    route?.options.pendingComponent ?? router.options.defaultPendingComponent,
  )
  const errorComponent = $derived(
    route?.options.errorComponent ?? router.options.defaultErrorComponent,
  )
  // The root route falls back to `notFoundRoute`'s component before the
  // router-wide default, like the other ports.
  const notFoundComponent = $derived(
    route?.options.notFoundComponent ??
      (route?.isRoot
        ? router.options.notFoundRoute?.options.component
        : undefined) ??
      router.options.defaultNotFoundComponent,
  )

  const status = $derived(match?.status)

  // Root-only document shell (see RootRouteOptionsExtensions in route.ts).
  const ShellComponent = $derived(
    route?.isRoot
      ? ((
          route.options as { shellComponent?: Component<{ children: Snippet }> }
        ).shellComponent ?? undefined)
      : undefined,
  )

  // Selective SSR: `ssr: false` / `'data-only'` routes render only their
  // pending view on the server and mount their component once hydrated.
  const resolvedNoSsr = $derived(
    match?.ssr === false || match?.ssr === 'data-only',
  )

  // `remountDeps` re-keys the component so it remounts when the chosen deps
  // (loaderDeps/params/search) change instead of updating in place.
  const componentKey = $derived.by(() => {
    const remount =
      route?.options.remountDeps ?? router.options.defaultRemountDeps
    if (!remount || !match) {
      return routeId
    }
    const deps = remount({
      routeId,
      loaderDeps: match.loaderDeps,
      params: match._strictParams,
      search: match._strictSearch,
    })
    return JSON.stringify(deps) ?? routeId
  })

  // Errors caught by this route's boundary: not-founds are forwarded to the
  // not-found handling in `failed`; everything else is reported through
  // `onCatch` / `defaultOnCatch`, like the other ports.
  function onBoundaryError(error: unknown) {
    if (isNotFound(error)) {
      return
    }
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Warning: Error in route match: ${routeId}`)
    }
    ;(route?.options.onCatch ?? router.options.defaultOnCatch)?.(toError(error))
  }

  // On the server, direct children of the root emit the scroll-restoration
  // bootstrap when the router opts in (mirrors solid-router's Match).
  const renderScrollRestoration = $derived(
    (isServer ?? router.isServer) &&
      route?.parentRoute?.id === rootRouteId &&
      !!router.options.scrollRestoration,
  )

  // Decide whether this Match should render `notFoundComponent` or bubble the
  // not-found error up to a parent Match's boundary. The `errSrc` arg is the
  // actual error (either from the match itself or bubbled into the boundary).
  function shouldHandleNotFoundHere(
    m: any,
    r: AnyRoute | undefined,
    rtr: any,
    errSrc?: any,
  ): boolean {
    const nfErr = errSrc ?? m?.error
    const routeIdTarget = nfErr?.routeId
    const hasOwnNotFound =
      !!r?.options.notFoundComponent ||
      !!(
        r?.isRoot &&
        (rtr.options.notFoundRoute?.options.component ||
          rtr.options.defaultNotFoundComponent)
      )
    if (routeIdTarget) {
      // Explicit routeId: only the matching route renders its notFoundComponent.
      return r?.id === routeIdTarget && hasOwnNotFound
    }
    // No explicit routeId: any route with a notFoundComponent handles it.
    return hasOwnNotFound
  }
</script>

{#snippet pending()}
  {#if pendingComponent}
    <NonRouteComponentContext component="pendingComponent">
      {#if isSnippet(pendingComponent)}
        {@render (pendingComponent as Snippet<[]>)()}
      {:else}
        {@const C = pendingComponent as Component<Record<string, never>>}
        <C />
      {/if}
    </NonRouteComponentContext>
  {/if}
{/snippet}

{#snippet content()}
  {#key componentKey}
    {#if component}
      {#if isSnippet(component)}
        {@render (component as Snippet<[]>)()}
      {:else}
        {@const C = component as Component<Record<string, never>>}
        <C />
      {/if}
    {:else}
      <Outlet />
    {/if}
  {/key}
{/snippet}

{#snippet inner()}
  {#if !match}
    <!-- no match -->
  {:else if status === 'pending'}
    {@render pending()}
  {:else if status === 'notFound'}
    <!-- router-core already picked this route as the not-found boundary. -->
    {#if route}
      <RouteNotFound {route} error={match.error} />
    {/if}
  {:else if status === 'error'}
    {#if route?.options.errorComponent || router.options.defaultErrorComponent}
      {@const RouteErrorComponent = (errorComponent ??
        ErrorComponent) as Component<any>}
      <!-- Direct (non-boundary) error render: no boundary reset is available
           here, so `reset` is undefined. -->
      <NonRouteComponentContext component="errorComponent">
        <RouteErrorComponent
          error={toError(match.error)}
          reset={undefined as any}
          info={{ componentStack: '' }}
        />
      </NonRouteComponentContext>
    {:else}
      <ErrorBubbler error={match.error} />
    {/if}
  {:else}
    {@const RouteErrorComponent = (errorComponent ??
      ErrorComponent) as Component<any>}
    <svelte:boundary onerror={onBoundaryError}>
      {#if resolvedNoSsr}
        <ClientOnly>
          {#snippet fallback()}{@render pending()}{/snippet}
          {@render content()}
        </ClientOnly>
      {:else}
        {@render content()}
      {/if}
      {#snippet failed(error, reset)}
        {#if isNotFound(error)}
          {#if shouldHandleNotFoundHere(match, route, router, error)}
            <NonRouteComponentContext component="notFoundComponent">
              {#if isSnippet(notFoundComponent)}
                {@render (notFoundComponent as Snippet<[]>)()}
              {:else if notFoundComponent}
                {@const NF = notFoundComponent as Component<any>}
                <NF data={(error as any)?.data} />
              {/if}
            </NonRouteComponentContext>
          {:else}
            <ErrorBubbler {error} />
          {/if}
        {:else if route?.options.errorComponent || router.options.defaultErrorComponent}
          <NonRouteComponentContext component="errorComponent">
            {#if isSnippet(errorComponent)}
              {@render (errorComponent as Snippet<[]>)()}
            {:else}
              <!-- Boundary-caught error: `reset` re-renders the boundary
                   contents, so the error component's `props.reset()` retries. -->
              <RouteErrorComponent
                error={toError(error)}
                reset={reset as () => void}
                info={{ componentStack: '' }}
              />
            {/if}
          </NonRouteComponentContext>
        {:else}
          <ErrorBubbler {error} />
        {/if}
      {/snippet}
    </svelte:boundary>
  {/if}
{/snippet}

{#if ShellComponent}
  <ShellComponent>{@render inner()}</ShellComponent>
{:else}
  {@render inner()}
{/if}
{#if renderScrollRestoration}
  <ScrollRestoration />
{/if}
