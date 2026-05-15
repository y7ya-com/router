<script lang="ts">
  import { getContext } from 'svelte'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import {
    defaultNearestMatchContext,
    nearestMatchContextKey,
    type NearestMatchContextValue,
  } from './matchContext'
  import Match from './Match.svelte'

  const router = useRouter()
  const nearestParentMatch =
    (getContext(nearestMatchContextKey) as NearestMatchContextValue | undefined) ??
    defaultNearestMatchContext

  const childMatchIdByRouteIdSel = useSelector(
    router.stores.childMatchIdByRouteId,
  )

  const routeId = $derived(nearestParentMatch.routeId())
  const childMatchId = $derived(
    routeId ? childMatchIdByRouteIdSel.current[routeId] : undefined,
  )
</script>

{#if childMatchId}
  <Match matchId={childMatchId} />
{/if}
