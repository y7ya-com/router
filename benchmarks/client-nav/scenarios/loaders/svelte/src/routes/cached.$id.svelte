<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { itemsChecksum, makeItems } from '../../../shared'

  const subscriberIndexes = Array.from({ length: 2 }, (_, index) => index)

  export const Route = createFileRoute('/cached/$id')({
    loader: ({ params }) => {
      const items = makeItems(`cached-${params.id}`)
      return { items, checksum: itemsChecksum(items) }
    },
    staleTime: 1e9,
    gcTime: 1e9,
  })
</script>

<script lang="ts">
  import SumSubscriber from '../components/CachedSumSubscriber.svelte'
  import FirstItemSubscriber from '../components/CachedFirstItemSubscriber.svelte'

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
  <h1>Cached</h1>
  <div data-testid="cached-state">
    {`c-${params.current.id}-${loaderData.current.checksum}`}
  </div>
  <ul>
    {#each loaderData.current.items.slice(0, 5) as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
</main>
