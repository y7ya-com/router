<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import SearchStateSubscriber from './SearchStateSubscriber.svelte'
  import SearchLoaderDepsSubscriber from './SearchLoaderDepsSubscriber.svelte'
  import SearchLoaderDataSubscriber from './SearchLoaderDataSubscriber.svelte'
  import { searchRoute } from '../routes'
  import { routeSelectors } from '../perf'
</script>

{#each routeSelectors as selector (`search-state-${selector}`)}
  <SearchStateSubscriber />
{/each}
{#each routeSelectors as selector (`search-loader-deps-${selector}`)}
  <SearchLoaderDepsSubscriber />
{/each}
{#each routeSelectors as selector (`search-loader-data-${selector}`)}
  <SearchLoaderDataSubscriber />
{/each}
<Link
  data-testid="search-next-page"
  from={searchRoute.fullPath}
  to="."
  replace
  search={(prev: { page: number; filter: string }) => ({
    page: prev.page + 1,
    filter: prev.filter,
    junk: 'local-updater',
  })}
  activeOptions={{ includeSearch: true }}
  activeProps={{ class: 'active-link' }}
  inactiveProps={{ class: 'inactive-link' }}
>
  Next page
</Link>
