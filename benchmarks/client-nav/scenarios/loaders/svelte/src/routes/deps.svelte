<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import type { SearchSchemaInput } from '@tanstack/svelte-router'
  import { itemsChecksum, makeItems, normalizePage } from '../../../shared'

  const subscriberIndexes = Array.from({ length: 2 }, (_, index) => index)

  export const Route = createFileRoute('/deps')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput) => ({
      page: normalizePage(search.page),
    }),
    loaderDeps: ({ search }) => ({ page: search.page }),
    loader: ({ deps }) => {
      const items = makeItems(`deps-${deps.page}`)
      return { items, checksum: itemsChecksum(items) }
    },
    staleTime: 1e9,
    gcTime: 1e9,
  })
</script>

<script lang="ts">
  import SumSubscriber from '../components/DepsSumSubscriber.svelte'
  import DepsSubscriber from '../components/DepsSubscriber.svelte'

  const search = Route.useSearch()
  const loaderData = Route.useLoaderData()
</script>

<main>
  {#each subscriberIndexes as index (`sum-${index}`)}
    <SumSubscriber />
  {/each}
  {#each subscriberIndexes as index (`deps-${index}`)}
    <DepsSubscriber />
  {/each}
  <h1>Deps</h1>
  <div data-testid="deps-state">
    {`d-${search.current.page}-${loaderData.current.checksum}`}
  </div>
  <ul>
    {#each loaderData.current.items.slice(0, 5) as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
</main>
