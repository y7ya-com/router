<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  let { promise, testId }: { promise: Promise<string>; testId: string } =
    $props()
</script>

<Await {promise}>
  {#snippet children(value)}
    <div data-testid={testId}>{value}</div>
  {/snippet}
  {#snippet fallback()}
    <div data-testid={`${testId}-loading`}>Loading...</div>
  {/snippet}
</Await>
