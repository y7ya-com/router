<script module lang="ts">
  import {
    createFileRoute,
    retainSearchParams,
    stripSearchParams,
  } from '@tanstack/svelte-router'
  import type { SearchSchemaInput } from '@tanstack/svelte-router'
  import {
    normalizeProductsSearch,
    productsLoaderChecksum,
  } from '../../../shared'

  export const Route = createFileRoute('/products')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput) =>
      normalizeProductsSearch(search),
    search: {
      middlewares: [
        retainSearchParams(['perPage', 'sort']),
        stripSearchParams({ page: 1 }),
      ],
    },
    loaderDeps: ({ search }) => ({
      page: search.page,
      sort: search.sort,
      filters: search.filters,
    }),
    loader: ({ deps }) => ({
      checksum: productsLoaderChecksum(deps),
    }),
    staleTime: 1e9,
    gcTime: 1e9,
  })
</script>

<script lang="ts">
  import PageSubscriber from '../components/PageSubscriber.svelte'
  import FiltersSubscriber from '../components/FiltersSubscriber.svelte'
  import QuerySubscriber from '../components/QuerySubscriber.svelte'
  import { productsMarkerText } from '../../../shared'

  const subscriberIndexes = Array.from({ length: 2 }, (_, index) => index)

  const search = Route.useSearch()
  const loaderData = Route.useLoaderData()
</script>

<main>
  {#each subscriberIndexes as index (`page-${index}`)}
    <PageSubscriber />
  {/each}
  {#each subscriberIndexes as index (`filters-${index}`)}
    <FiltersSubscriber />
  {/each}
  {#each subscriberIndexes as index (`query-${index}`)}
    <QuerySubscriber />
  {/each}
  <h1>Products</h1>
  <div data-testid="products-state">{productsMarkerText(search.current)}</div>
  <p>{`checksum ${loaderData.current.checksum}`}</p>
</main>
