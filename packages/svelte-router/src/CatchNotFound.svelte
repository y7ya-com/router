<script lang="ts">
  import type { Snippet } from 'svelte'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter'
  import { getNotFound } from './not-found'
  import ErrorBubbler from './ErrorBubbler.svelte'
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

  const resetKey = $derived(
    `not-found-${locationSel.current.pathname}-${statusSel.current}`,
  )

  function onerror(error: unknown) {
    const notFoundError = getNotFound(error)
    if (notFoundError) onCatch?.(notFoundError)
  }
</script>

<!-- When the reset key changes, the boundary remounts its children. -->
{#key resetKey}
  <svelte:boundary {onerror}>
    {#if children}{@render children()}{/if}

    {#snippet failed(error)}
      {@const notFoundError = getNotFound(error)}
      {#if notFoundError}
        {#if fallback}{@render fallback(notFoundError)}{/if}
      {:else}
        <!-- Not a notFound: rethrow to the surrounding boundary. -->
        <ErrorBubbler {error} />
      {/if}
    {/snippet}
  </svelte:boundary>
{/key}
