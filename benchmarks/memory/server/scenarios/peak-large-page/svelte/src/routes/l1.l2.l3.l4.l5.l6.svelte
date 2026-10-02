<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    makeLargePageHead,
    makeLargePageLevelData,
  } from '../../../large-page-data'

  export const Route = createFileRoute('/l1/l2/l3/l4/l5/l6')({
    loader: () => makeLargePageLevelData(6, 0x5eed_1006),
    head: ({ loaderData }) => makeLargePageHead(loaderData),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
  const first = $derived(data.current.records[0]!)
</script>

<section data-bench={data.current.marker}>
  <h2>{data.current.marker}</h2>
  <p>records: {data.current.records.length}</p>
  <article>
    <h3>{first.name}</h3>
    <p>{first.id}</p>
    <p>{first.description}</p>
  </article>
  <Outlet />
</section>
