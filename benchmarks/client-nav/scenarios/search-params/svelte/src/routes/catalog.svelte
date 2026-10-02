<script module lang="ts">
  import { createFileRoute, retainSearchParams } from '@tanstack/svelte-router'
  import type { SearchSchemaInput } from '@tanstack/svelte-router'
  import { normalizeCatalogSearch } from '../../../shared'

  export const Route = createFileRoute('/catalog')({
    validateSearch: (search: Record<string, unknown> & SearchSchemaInput) =>
      normalizeCatalogSearch(search),
    search: {
      middlewares: [retainSearchParams(['perPage', 'sort'])],
    },
  })
</script>

<script lang="ts">
  import ViewSubscriber from '../components/ViewSubscriber.svelte'
  import { catalogMarkerText } from '../../../shared'

  const subscriberIndexes = Array.from({ length: 2 }, (_, index) => index)

  const search = Route.useSearch()
</script>

<main>
  {#each subscriberIndexes as index (`view-${index}`)}
    <ViewSubscriber />
  {/each}
  <h1>Catalog</h1>
  <div data-testid="catalog-state">{catalogMarkerText(search.current)}</div>
</main>
