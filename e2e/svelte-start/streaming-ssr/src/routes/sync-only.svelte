<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeSyncOnlyData } from '../../../../streaming-ssr-fixtures'

  export const Route = createFileRoute('/sync-only')({
    loader: async () => makeSyncOnlyData(),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div style="padding: 20px">
  <h1 data-testid="sync-title">Synchronous Serialization Test</h1>
  <p data-testid="sync-message">{data.current.message}</p>
  <p data-testid="sync-timestamp">Loaded at: {data.current.timestamp}</p>
  <p data-testid="sync-source">Source: {data.current.source}</p>
  <ul data-testid="sync-items">
    {#each data.current.items as item (item)}
      <li data-testid={`sync-item-${item}`}>{item}</li>
    {/each}
  </ul>
</div>
