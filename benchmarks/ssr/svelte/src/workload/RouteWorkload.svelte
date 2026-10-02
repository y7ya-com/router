<script lang="ts">
  import LinkProbe from './LinkProbe.svelte'
  import ParamsProbe from './ParamsProbe.svelte'
  import SearchProbe from './SearchProbe.svelte'
  import { probes } from './selector-work'
</script>

{#each probes as probe (`params-${probe}`)}
  <ParamsProbe salt={probe + 1} />
{/each}
{#each probes as probe (`search-${probe}`)}
  <SearchProbe salt={probe + 11} />
{/each}
{#each probes as probe (`link-${probe}`)}
  <LinkProbe salt={probe + 21} />
{/each}
