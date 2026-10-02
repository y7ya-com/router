<script lang="ts">
  import ContextParamsSubscriber from './ContextParamsSubscriber.svelte'
  import ContextRouteSubscriber from './ContextRouteSubscriber.svelte'
  import { routeSelectors } from '../perf'
</script>

{#each routeSelectors as selector (`context-params-${selector}`)}
  <ContextParamsSubscriber />
{/each}
{#each routeSelectors as selector (`context-route-${selector}`)}
  <ContextRouteSubscriber />
{/each}
