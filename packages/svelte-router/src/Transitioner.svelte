<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { getLocationChangeInfo, trimPathRight } from '@tanstack/router-core'
  import { isServer } from '@tanstack/router-core/isServer'
  import { useSelector, batch } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'

  const router = useRouter()

  router.startTransition = (fn: () => void | Promise<void>) => {
    void fn()
  }

  let unsubHistory: (() => void) | null = null

  onMount(() => {
    if (isServer ?? router.isServer) return

    unsubHistory = router.history.subscribe(router.load)

    // Re-read the URL from history before any check — tests sometimes call
    // `window.history.replaceState(...)` AFTER `createRouter(...)` but BEFORE
    // `render(...)`, and we need to see the post-replaceState URL.
    ;(router as any).updateLatestLocation?.()

    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true,
    })

    if (
      trimPathRight(router.latestLocation.publicHref) !==
      trimPathRight(nextLocation.publicHref)
    ) {
      router.commitLocation({ ...nextLocation, replace: true })
    }

    void router.load().catch((err: unknown) => {
      console.error(err)
    })

    // The "already settled" case is handled by the settle block in the $effect
    // below, which keys off `status` rather than a pending edge — see there.
  })

  onDestroy(() => {
    unsubHistory?.()
  })

  const isLoadingSel = useSelector(router.stores.isLoading)
  const hasPendingSel = useSelector(router.stores.hasPending)

  let prevIsLoading = false
  let prevIsPagePending = false

  $effect(() => {
    const isLoading = isLoadingSel.current
    const hasPending = hasPendingSel.current
    const currentIsAnyPending = isLoading || hasPending
    const isPagePending = hasPending

    // onLoad — fires when isLoading transitions from true → false.
    if (prevIsLoading && !isLoading) {
      router.emit({
        type: 'onLoad',
        ...getLocationChangeInfo(
          router.stores.location.get(),
          router.stores.resolvedLocation.get(),
        ),
      })
    }

    // onBeforeRouteMount — fires when isPagePending transitions true → false.
    if (prevIsPagePending && !isPagePending) {
      router.emit({
        type: 'onBeforeRouteMount',
        ...getLocationChangeInfo(
          router.stores.location.get(),
          router.stores.resolvedLocation.get(),
        ),
      })
    }

    // Settle whenever nothing is pending and the router hasn't settled yet.
    // Keying off `status` rather than a `prevIsAnyPending → false` edge is
    // essential: with a small tree or synchronous loaders the load finishes
    // before this effect first runs, so `prevIsAnyPending` is never true, the
    // edge never occurs, and `status` would stay 'pending' forever. Core sets
    // `status` back to 'pending' for each new navigation, so this still fires
    // exactly once per cycle.
    if (!currentIsAnyPending && router.stores.status.get() === 'pending') {
      const changeInfo = getLocationChangeInfo(
        router.stores.location.get(),
        router.stores.resolvedLocation.get(),
      )
      // Only if the edge above didn't already emit it, so the
      // onBeforeRouteMount → onResolved order holds either way.
      if (!prevIsPagePending) {
        router.emit({ type: 'onBeforeRouteMount', ...changeInfo })
      }
      router.emit({ type: 'onResolved', ...changeInfo })

      batch(() => {
        router.stores.status.set('idle')
        router.stores.resolvedLocation.set(router.stores.location.get())
      })
    }
    prevIsLoading = isLoading
    prevIsPagePending = isPagePending
  })
</script>
