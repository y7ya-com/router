<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeBigPayload, sleep0 } from '../../../shared-data'

  export const Route = createFileRoute('/stream/$id')({
    loader: ({ params }) => ({
      fast: { label: `fast-${params.id}` },
      slowSmall: sleep0().then(() => ({ label: `slow-small-${params.id}` })),
      slowBig: sleep0().then(() => makeBigPayload(params.id)),
    }),
  })
</script>

<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<p>{data.current.fast.label}</p>
<p>loading-small</p>
<Await promise={data.current.slowSmall}>
  {#snippet children(d)}
    <p>{d.label}</p>
  {/snippet}
</Await>
<p>loading-big</p>
<Await promise={data.current.slowBig}>
  {#snippet children(d)}
    <section>
      <h2>{d.label}</h2>
      {#each d.chunks as chunk (chunk.index)}
        <p>{chunk.value}</p>
      {/each}
    </section>
  {/snippet}
</Await>
