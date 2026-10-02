<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import RootParamsSubscriber from './RootParamsSubscriber.svelte'
  import RootSearchSubscriber from './RootSearchSubscriber.svelte'
  import LinkPanel from './LinkPanel.svelte'
  import { rootSelectors } from '../perf'
</script>

{#each rootSelectors as selector (`root-params-${selector}`)}
  <RootParamsSubscriber />
{/each}
{#each rootSelectors as selector (`root-search-${selector}`)}
  <RootSearchSubscriber />
{/each}
<LinkPanel />
<Outlet />
