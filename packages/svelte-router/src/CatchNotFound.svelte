<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import { getNotFound } from './not-found'
  import CatchBoundary from './CatchBoundary.svelte'
  import type { NotFoundError } from '@tanstack/router-core'

  type Props = {
    fallback?: Snippet<[NotFoundError]>
    onCatch?: (error: NotFoundError) => void
    children?: Snippet
  }

  let { fallback, onCatch, children }: Props = $props()

  const router = useRouter()
  const locationSel = useSelector(router.stores.location)
  const statusSel = useSelector(router.stores.status)

  function getResetKey() {
    return `not-found-${locationSel.current.pathname}-${statusSel.current}`
  }

  function handleCatch(error: Error) {
    const notFoundError = getNotFound(error)
    if (notFoundError) {
      onCatch?.(notFoundError)
    } else {
      throw error
    }
  }
</script>

<CatchBoundary
  getResetKey={getResetKey}
  onCatch={handleCatch}
>
  {#if children}{@render children()}{/if}
</CatchBoundary>
