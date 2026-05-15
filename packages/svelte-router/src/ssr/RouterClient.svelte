<script lang="ts">
  import { hydrate } from '@tanstack/router-core/ssr/client'
  import RouterProvider from '../RouterProvider.svelte'
  import HeadContent from '../HeadContent.svelte'
  import type { AnyRouter } from '@tanstack/router-core'

  type Props = { router: AnyRouter }
  let { router }: Props = $props()

  // Trigger router hydration on first mount if no matches yet.
  let hydrationPromise = $state<Promise<unknown> | undefined>()
  $effect(() => {
    if (hydrationPromise) return
    if (!router.stores.matchesId.get().length) {
      hydrationPromise = hydrate(router as any) as unknown as Promise<unknown>
    } else {
      hydrationPromise = Promise.resolve()
    }
  })
</script>

{#if hydrationPromise}
  {#await hydrationPromise then}
    <HeadContent />
    <RouterProvider {router} />
  {/await}
{/if}
