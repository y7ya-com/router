<script lang="ts">
  import { setContext } from 'svelte'
  import { getLocationChangeInfo, rootRouteId } from '@tanstack/router-core'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import {
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext'
  import Match from './Match.svelte'
  import Transitioner from './Transitioner.svelte'

  const router = useRouter()

  const firstIdSel = useSelector(router.stores.firstId)
  const rootMatchStore = router.stores.getRouteMatchStore(rootRouteId)
  const rootMatchSel = useSelector(rootMatchStore)
  const pendingRouteIdsSel = useSelector(router.stores.pendingRouteIds)
  const resolvedLocationSel = useSelector(router.stores.resolvedLocation)

  const matchId = $derived(firstIdSel.current)
  const routeId = $derived(matchId ? rootRouteId : undefined)

  const nearestMatch: NearestMatchContextValue = {
    matchId: () => matchId,
    routeId: () => routeId,
    match: () => (routeId ? rootMatchSel.current : undefined),
    hasPending: () =>
      routeId ? Boolean(pendingRouteIdsSel.current[rootRouteId]) : false,
  }
  setContext(nearestMatchContextKey, nearestMatch)

  // onRendered: fires once on first mount, then again when the resolved
  // location's TSR key changes.
  let firstRender = true
  let prevResolvedKey: any = undefined
  $effect(() => {
    const k = (resolvedLocationSel.current as any)?.state?.__TSR_key
    if (firstRender || k !== prevResolvedKey) {
      firstRender = false
      prevResolvedKey = k
      router.emit({
        type: 'onRendered',
        ...getLocationChangeInfo(
          router.stores.location.get(),
          router.stores.resolvedLocation.get(),
        ),
      })
    }
  })
</script>

<Transitioner />
{#if matchId}
  <Match {matchId} />
{/if}
