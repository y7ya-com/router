<script lang="ts">
  import { Await } from '@tanstack/svelte-router'

  let {
    promise,
    testId,
    label,
  }: {
    promise: Promise<string>
    testId: string
    label: string
  } = $props()
</script>

<Await {promise}>
  {#snippet children(value)}
    <div data-testid={testId}>
      {label}: {value}
    </div>
  {/snippet}
  {#snippet fallback()}
    <div data-testid={`${testId}-loading`}>
      Loading {label}...
    </div>
  {/snippet}
</Await>
