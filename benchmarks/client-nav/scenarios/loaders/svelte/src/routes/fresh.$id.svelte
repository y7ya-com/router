<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { itemsChecksum, makeItems } from '../../../shared'

  const subscriberIndexes = Array.from({ length: 2 }, (_, index) => index)

  export const Route = createFileRoute('/fresh/$id')({
    loader: ({ params }) => {
      const items = makeItems(`fresh-${params.id}`)
      return { items, checksum: itemsChecksum(items) }
    },
    staleTime: 0,
    gcTime: 0,
  })
</script>

<script lang="ts">
  import SumSubscriber from '../components/FreshSumSubscriber.svelte'
  import FirstItemSubscriber from '../components/FreshFirstItemSubscriber.svelte'

  const params = Route.useParams()
  const loaderData = Route.useLoaderData()
</script>

<main>
  {#each subscriberIndexes as index (`sum-${index}`)}
    <SumSubscriber />
  {/each}
  {#each subscriberIndexes as index (`first-${index}`)}
    <FirstItemSubscriber />
  {/each}
  <h1>Fresh</h1>
  <div data-testid="fresh-state">
    {`f-${params.current.id}-${loaderData.current.checksum}`}
  </div>
  <ul>
    {#each loaderData.current.items.slice(0, 5) as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
</main>
