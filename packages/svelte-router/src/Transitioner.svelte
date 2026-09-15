<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte'
  import { trimPathRight } from '@tanstack/router-core'
  import { isServer } from '@tanstack/router-core/isServer'
  import { useRouter } from './useRouter.js'

  const router = useRouter()

  // router-core hands the store commit to the framework and awaits `true` once
  // the committed state has rendered (`false` if a newer transition superseded
  // it). Svelte applies store changes on the next microtask flush, which is
  // exactly what `tick()` resolves after.
  let settleCurrent: ((rendered: boolean) => void) | undefined
  router.startTransition = (fn) => {
    settleCurrent?.(false)

    return new Promise<boolean>((resolve, reject) => {
      const settle = (rendered: boolean) => {
        if (settleCurrent !== settle) {
          return
        }
        settleCurrent = undefined
        resolve(rendered)
      }
      const fail = (cause: unknown) => {
        if (settleCurrent !== settle) {
          return
        }
        settleCurrent = undefined
        reject(cause)
      }
      settleCurrent = settle

      try {
        fn()
      } catch (cause) {
        fail(cause)
        return
      }
      tick().then(() => settle(true), fail)
    })
  }

  let unsubHistory: (() => void) | undefined

  onMount(() => {
    if (isServer ?? router.isServer) {
      return
    }

    unsubHistory = router.history.subscribe(router.load)

    // Re-read the URL from history before any check — callers sometimes
    // replaceState between `createRouter` and the first render.
    ;(router as any).updateLatestLocation?.()

    const nextLocation = router.buildLocation({
      to: router.latestLocation.pathname,
      search: true,
      params: true,
      hash: true,
      state: true,
      _includeValidateSearch: true,
    })

    // Canonicalize the URL if it does not already match.
    if (
      trimPathRight(router.latestLocation.publicHref) !==
      trimPathRight(nextLocation.publicHref)
    ) {
      router.commitLocation({
        ...nextLocation,
        replace: true,
        ignoreBlocker: true,
      })
      return
    }

    const resolved = router.stores.resolvedLocation.get()
    const alreadyResolved =
      resolved?.href === router.latestLocation.href &&
      resolved.state.__TSR_key === router.latestLocation.state.__TSR_key
    if (!alreadyResolved && !(router as any)._tx) {
      router.load().catch(console.error)
    }
  })

  onDestroy(() => {
    settleCurrent?.(false)
    unsubHistory?.()
  })
</script>
