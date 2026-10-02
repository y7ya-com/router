<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeDeferredRecords } from '../../../deferred-records'
  import { getRequestSignal } from '../request-signal'

  export const Route = createFileRoute('/stream/$id')({
    loader: ({ params }) => ({
      eager: `eager-${params.id}`,
      alpha: makeDeferredRecords(params.id, 'alpha', getRequestSignal()),
      beta: makeDeferredRecords(params.id, 'beta', getRequestSignal()),
    }),
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<main data-bench="aborted-requests-stream">
  <p data-bench="aborted-requests-eager">{data.current.eager}</p>
  <p data-bench="aborted-requests-alpha-fallback">loading-alpha</p>
  <p data-bench="aborted-requests-beta-fallback">loading-beta</p>
  <Await promise={data.current.alpha}>
    {#snippet children(records)}
      <ul data-bench="aborted-requests-alpha">
        {#each records as record (record.id)}
          <li>{record.label}</li>
        {/each}
      </ul>
    {/snippet}
  </Await>
  <Await promise={data.current.beta}>
    {#snippet children(records)}
      <ul data-bench="aborted-requests-beta">
        {#each records as record (record.id)}
          <li>{record.label}</li>
        {/each}
      </ul>
    {/snippet}
  </Await>
</main>
