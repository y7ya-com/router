<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { queryOptions } from '@tanstack/svelte-query'

  const deferredQueryOptions = () =>
    queryOptions({
      queryKey: ['deferred'],
      queryFn: async () => {
        await new Promise((r) => setTimeout(r, 3000))
        return {
          message: `Hello deferred from the server!`,
          status: 'success',
          time: new Date(),
        }
      },
    })

  export const Route = createFileRoute('/deferred')({
    loader: ({ context }) => {
      // Kick off loading as early as possible!
      context.queryClient.prefetchQuery(deferredQueryOptions())
    },
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  let count = $state(0)

  const deferredQuery = createQuery(() => deferredQueryOptions())
</script>

<div class="p-2">
  {#if deferredQuery.isPending}
    Loading Middleman...
  {:else}
    <div>
      <h1>Deferred Query</h1>
      <div>Status: {deferredQuery.data?.status ?? 'loading...'}</div>
      <div>Message: {deferredQuery.data?.message ?? ''}</div>
      <div>
        Time: {deferredQuery.data
          ? new Date(deferredQuery.data.time).toISOString()
          : ''}
      </div>
    </div>
  {/if}
  <div>Count: {count}</div>
  <div>
    <button onclick={() => (count += 1)}>Increment</button>
  </div>
</div>
