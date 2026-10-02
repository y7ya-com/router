<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import DeferredRejectionError from '~/components/DeferredRejectionError.svelte'
  import {
    deferredDataDelay,
    deferredErrorMessage,
  } from '../../../../streaming-ssr-fixtures'

  export const Route = createFileRoute('/deferred-rejection')({
    loader: async () => {
      return {
        deferredData: new Promise<string>((_resolve, reject) => {
          setTimeout(() => {
            reject(new Error(deferredErrorMessage))
          }, deferredDataDelay)
        }),
      }
    },
    errorComponent: DeferredRejectionError,
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h2>Deferred Rejection Test</h2>
  <Await promise={data.current.deferredData}>
    {#snippet children(value)}
      <div data-testid="deferred-data">{value}</div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="deferred-loading">Loading deferred...</div>
    {/snippet}
  </Await>
</div>
