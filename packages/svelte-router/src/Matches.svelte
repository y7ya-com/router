<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import { getLocationChangeInfo, rootRouteId } from '@tanstack/router-core'
  import { useRouterSelector } from './utils.js'
  import { useRouter } from './useRouter.js'
  import {
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext.js'
  import Match from './Match.svelte'
  import Transitioner from './Transitioner.svelte'

  const router = useRouter()

  // `InnerWrap` wraps the match tree inside the router context (integrations
  // that need router hooks); `Wrap` (RouterContextProvider) wraps outside it.
  const InnerWrap = router.options.InnerWrap

  const idsSel = useRouterSelector(router, router.stores.ids)
  const rootMatchSel = useRouterSelector(
    router,
    router.stores.getMatchStore(rootRouteId),
  )

  const routeId = $derived(idsSel.current[0])

  const nearestMatch: NearestMatchContextValue = {
    routeId: () => routeId,
    match: () => (routeId ? rootMatchSel.current : undefined),
  }
  setContext(nearestMatchContextKey, nearestMatch)

  // After the first paint, report the location as rendered if the router had
  // already resolved it (the SSR/hydration case — later navigations are
  // reported by router-core once `startTransition` settles).
  onMount(() => {
    const resolvedLocation = router.stores.resolvedLocation.get()
    if (
      resolvedLocation?.href === router.latestLocation.href &&
      resolvedLocation.state.__TSR_key === router.latestLocation.state.__TSR_key
    ) {
      router.emit({
        type: 'onRendered',
        ...getLocationChangeInfo(resolvedLocation, resolvedLocation),
      })
    }
  })
</script>

{#snippet tree()}
  <Transitioner />
  {#if routeId}
    {#key routeId}
      <Match {routeId} />
    {/key}
  {/if}
{/snippet}

{#if InnerWrap}
  <InnerWrap>{@render tree()}</InnerWrap>
{:else}
  {@render tree()}
{/if}
