<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  let {
    level3,
  }: {
    level3: Promise<{ level: number; timestamp: number }>
  } = $props()
</script>

<div style="margin-left: 20px; padding-left: 10px">
  <Await promise={level3}>
    {#snippet children(value)}
      <div data-testid="level3-data">
        Level 3: {value.level} @ {value.timestamp}
      </div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="level3-loading">Loading level 3...</div>
    {/snippet}
  </Await>
</div>
