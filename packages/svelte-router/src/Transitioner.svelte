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
  let prevIsAnyPending = false

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

    // If the router was already loaded before mount (test calling
    // `await router.load()` then `render(...)`), the prev→current isAnyPending
    // transition never happens because both start as false. Emit a one-time
    // onResolved + onBeforeRouteMount so subscribers see the initial render.
    if (!isLoadingSel.current && !hasPendingSel.current) {
      const changeInfo = getLocationChangeInfo(
        router.stores.location.get(),
        router.stores.resolvedLocation.get(),
      )
      router.emit({ type: 'onBeforeRouteMount', ...changeInfo })
      router.emit({ type: 'onResolved', ...changeInfo })
    }
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

    if (prevIsAnyPending && !currentIsAnyPending) {
      const changeInfo = getLocationChangeInfo(
        router.stores.location.get(),
        router.stores.resolvedLocation.get(),
      )
      router.emit({ type: 'onResolved', ...changeInfo })

      batch(() => {
        router.stores.status.set('idle')
        router.stores.resolvedLocation.set(router.stores.location.get())
      })
    }
    prevIsAnyPending = currentIsAnyPending
    prevIsLoading = isLoading
    prevIsPagePending = isPagePending
  })
</script>
