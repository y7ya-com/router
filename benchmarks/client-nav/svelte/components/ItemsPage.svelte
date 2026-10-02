<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import ItemParamsSubscriber from './ItemParamsSubscriber.svelte'
  import { itemsRoute } from '../routes'
  import { routeSelectors } from '../perf'
</script>

{#each routeSelectors as selector (`item-params-${selector}`)}
  <ItemParamsSubscriber />
{/each}
<Link
  data-testid="items-details"
  from={itemsRoute.fullPath}
  to="./details"
  replace
>
  Details
</Link>
<Link
  from={itemsRoute.fullPath}
  to="."
  search={true}
  activeOptions={{ includeSearch: true }}
>
  Preserve search on item
</Link>
<Outlet />
