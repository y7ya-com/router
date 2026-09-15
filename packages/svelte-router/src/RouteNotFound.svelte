<script lang="ts">
  import type { AnyRoute } from '@tanstack/router-core'
  import type { Component, Snippet } from 'svelte'
  import { useRouter } from './useRouter.js'
  import { isSnippet } from './utils.js'
  import DefaultGlobalNotFound from './DefaultGlobalNotFound.svelte'
  import NonRouteComponentContext from './NonRouteComponentContext.svelte'

  // The not-found view for a route: its own `notFoundComponent`, else the
  // router's `defaultNotFoundComponent`, else the generic fallback.
  let { route, error }: { route: AnyRoute; error: unknown } = $props()

  const router = useRouter()
  const component = $derived(
    route.options.notFoundComponent ??
      (route.isRoot
        ? router.options.notFoundRoute?.options.component
        : undefined) ??
      router.options.defaultNotFoundComponent,
  )
  const data = $derived((error as { data?: unknown } | undefined)?.data)

  // svelte-ignore state_referenced_locally
  if (
    process.env.NODE_ENV !== 'production' &&
    !route.options.notFoundComponent &&
    !router.options.defaultNotFoundComponent
  ) {
    console.warn(
      `Warning: A notFoundError was encountered on the route with ID "${route.id}", but a notFoundComponent option was not configured, nor was a router level defaultNotFoundComponent configured. Consider configuring at least one of these to avoid TanStack Router's overly generic defaultNotFoundComponent (<p>Not Found</p>)`,
    )
  }
</script>

<NonRouteComponentContext component="notFoundComponent">
  {#if !component}
    <DefaultGlobalNotFound />
  {:else if isSnippet(component)}
    {@render (component as Snippet<[{ data: unknown }]>)({ data })}
  {:else}
    {@const NotFoundComponent = component as Component<any>}
    <NotFoundComponent {data} />
  {/if}
</NonRouteComponentContext>
