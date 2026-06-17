<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { useRouter } from '@tanstack/svelte-router'
  import { ssrQueryStateByRouter } from './wrap-context'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()

  // The router context is established by `RouterProvider` before `Wrap` renders,
  // so `useRouter()` resolves the active router here and lets us recover the
  // `QueryClient` (and any pre-existing `Wrap`) stashed by the integration.
  const router = useRouter()
  const state = ssrQueryStateByRouter.get(router)
  const OGWrap = state?.ogWrap
</script>

{#if state}
  <QueryClientProvider client={state.client}>
    {#if OGWrap}
      <OGWrap>{@render children()}</OGWrap>
    {:else}
      {@render children()}
    {/if}
  </QueryClientProvider>
{:else}
  {@render children()}
{/if}
