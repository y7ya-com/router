<script lang="ts">
  import { Await } from '@tanstack/svelte-router'
  import Level2Content from './Level2Content.svelte'

  let {
    level2,
    level3,
  }: {
    level2: Promise<{ level: number; timestamp: number }>
    level3: Promise<{ level: number; timestamp: number }>
  } = $props()
</script>

<div style="margin-left: 20px; padding-left: 10px">
  <Await promise={level2}>
    {#snippet children(value)}
      <div data-testid="level2-data">
        Level 2: {value.level} @ {value.timestamp}
        <Level2Content {level3} />
      </div>
    {/snippet}
    {#snippet fallback()}
      <div data-testid="level2-loading">Loading level 2...</div>
    {/snippet}
  </Await>
</div>
