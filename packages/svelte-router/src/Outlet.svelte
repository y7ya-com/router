<script lang="ts">
  import { getContext } from 'svelte'
  import { useRouterSelector } from './utils.js'
  import type { AnyRoute, AnyRouter } from '@tanstack/router-core'
  import { useRouter } from './useRouter.js'
  import {
    defaultNearestMatchContext,
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext.js'
  import Match from './Match.svelte'
  import RouteNotFound from './RouteNotFound.svelte'
  import { nonRouteComponentContextKey } from './NonRouteComponentContext.svelte'

  const router = useRouter<AnyRouter>()
  const nearestParentMatch =
    (getContext(nearestMatchContextKey) as
      | NearestMatchContextValue
      | undefined) ?? defaultNearestMatchContext

  if (process.env.NODE_ENV !== 'production') {
    const nonRouteComponent = getContext(nonRouteComponentContextKey)
    if (nonRouteComponent) {
      console.warn(
        `Warning: An <Outlet /> was rendered inside a ${nonRouteComponent}. <Outlet /> should only be rendered inside a route component.`,
      )
    }
  }

  const idsSel = useRouterSelector(router, router.stores.ids)

  const routeId = $derived(nearestParentMatch.routeId())
  const parentMatch = $derived(nearestParentMatch.match())
  const route = $derived(
    routeId ? (router.routesById[routeId] as AnyRoute | undefined) : undefined,
  )
  // The child is the next route id in the presented match list. A parent
  // flagged `_notFound` renders the not-found view in its outlet instead.
  const childRouteId = $derived.by(() => {
    if (!routeId || parentMatch?._notFound) {
      return undefined
    }
    const ids = idsSel.current
    return ids[ids.indexOf(routeId) + 1]
  })
</script>

{#if childRouteId}
  {#key childRouteId}
    <Match routeId={childRouteId} />
  {/key}
{:else if parentMatch?._notFound && route}
  <RouteNotFound {route} error={parentMatch.error} />
{/if}
