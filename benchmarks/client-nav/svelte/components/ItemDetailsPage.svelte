<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import ItemParamsSubscriber from './ItemParamsSubscriber.svelte'
  import { itemDetailsRoute } from '../routes'
  import { routeSelectors } from '../perf'
</script>

{#each routeSelectors as selector (`detail-params-${selector}`)}
  <ItemParamsSubscriber />
{/each}
<Link
  data-testid="items-parent"
  from={itemDetailsRoute.fullPath}
  to=".."
  replace
  activeOptions={{ exact: true }}
>
  Back to item
</Link>
