<script lang="ts">
  import { setContext } from 'svelte'
  import { isNotFound } from '@tanstack/router-core'
  import type { AnyRoute, AnyRouteMatch } from '@tanstack/router-core'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import {
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext'
  import { isSnippet } from './utils'
  import Outlet from './Outlet.svelte'
  import ErrorComponent from './ErrorComponent.svelte'
  import ErrorBubbler from './ErrorBubbler.svelte'
  import type { Component, Snippet } from 'svelte'

  let { matchId }: { matchId: string } = $props()

  const router = useRouter()

  // matchStores is a Map (non-reactive), but each entry is a reactive atom.
  // matchId is a prop and can change — we subscribe imperatively to handle source changes.
  // Seed synchronously from the store so the match is present on the very first
  // render — including server render, where `$effect` never runs (without this,
  // `match` would stay `undefined` and nothing would server-render).
  let match = $state<AnyRouteMatch | undefined>(
    router.stores.matchStores.get(matchId)?.get(),
  )
  $effect(() => {
    const store = router.stores.matchStores.get(matchId)
    if (!store) {
      match = undefined
      return
    }
    match = store.get()
    return store.subscribe((next: AnyRouteMatch) => {
      match = next
    }).unsubscribe
  })

  const pendingRouteIdsSel = useSelector(router.stores.pendingRouteIds)

  const routeId = $derived(match?.routeId as string | undefined)
  const route = $derived(
    routeId ? (router.routesById[routeId] as AnyRoute | undefined) : undefined,
  )

  const nearestMatch: NearestMatchContextValue = {
    matchId: () => matchId,
    routeId: () => routeId,
    match: () => match,
    hasPending: () =>
      routeId ? Boolean(pendingRouteIdsSel.current[routeId]) : false,
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
  const notFoundComponent = $derived(
    route?.options.notFoundComponent ?? router.options.defaultNotFoundComponent,
  )

  const status = $derived(match?.status)

  // Decide whether this Match should render `notFoundComponent` or bubble the
  // not-found error up to a parent Match's boundary. Mirrors solid Match.tsx's
  // CatchNotFound re-throw mechanism. The `errSrc` arg is the actual error
  // (either from the match itself or bubbled into the boundary).
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
      !!(r?.isRoot && rtr.options.defaultNotFoundComponent)
    if (routeIdTarget) {
      // Explicit routeId: only the matching route renders its notFoundComponent.
      return r?.id === routeIdTarget && hasOwnNotFound
    }
    // No explicit routeId: any route with a notFoundComponent handles it.
    return hasOwnNotFound
  }
</script>

{#if !match}
  <!-- no match -->
{:else if status === 'pending' && pendingComponent}
  {#if isSnippet(pendingComponent)}
    {@render (pendingComponent as Snippet<[]>)()}
  {:else}
    {@const C = pendingComponent as Component<Record<string, never>>}
    <C />
  {/if}
{:else if status === 'notFound' || (match && (match as any).globalNotFound === true && notFoundComponent)}
  {#if shouldHandleNotFoundHere(match, route, router)}
    {#if isSnippet(notFoundComponent)}
      {@render (notFoundComponent as Snippet<[]>)()}
    {:else if notFoundComponent}
      {@const NF = notFoundComponent as Component<any>}
      <NF data={(match.error as any)?.data} />
    {/if}
  {:else}
    <ErrorBubbler error={match.error} />
  {/if}
{:else if status === 'error'}
  {#if route?.options.errorComponent || router.options.defaultErrorComponent}
    {@const RouteErrorComponent = (errorComponent ?? ErrorComponent) as Component<any>}
    <!-- Direct (non-boundary) error render: no boundary reset is available
         here, so `reset` is undefined — mirrors react-router's Match.tsx. -->
    <RouteErrorComponent
      error={match.error}
      reset={undefined as any}
      info={{ componentStack: '' }}
    />
  {:else}
    <ErrorBubbler error={match.error} />
  {/if}
{:else}
  {@const RouteErrorComponent = (errorComponent ?? ErrorComponent) as Component<any>}
  <svelte:boundary>
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
    {#snippet failed(error, reset)}
      {#if isNotFound(error)}
        {#if shouldHandleNotFoundHere(match, route, router, error)}
          {#if isSnippet(notFoundComponent)}
            {@render (notFoundComponent as Snippet<[]>)()}
          {:else if notFoundComponent}
            {@const NF = notFoundComponent as Component<any>}
            <NF data={(error as any)?.data} />
          {/if}
        {:else}
          <ErrorBubbler error={error} />
        {/if}
      {:else if route?.options.errorComponent || router.options.defaultErrorComponent}
        {#if isSnippet(errorComponent)}
          {@render (errorComponent as Snippet<[]>)()}
        {:else}
          <!-- Boundary-caught error: `reset` re-renders the boundary contents,
               so the error component's `props.reset()` actually retries (the
               Svelte analogue of react-router's CatchBoundary reset). -->
          <RouteErrorComponent
            error={error as Error}
            reset={reset as () => void}
            info={{ componentStack: '' }}
          />
        {/if}
      {:else}
        <ErrorBubbler error={error} />
      {/if}
    {/snippet}
  </svelte:boundary>
{/if}
