<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/server-function/nested')()
</script>

<script lang="ts">
  import RenderNestedData from '~/components/RenderNestedData.svelte'
  import { serverFnReturningNested } from './-functions/serverFnReturningNested'
  import type { NestedOuter } from '~/data'

  let nestedResponse = $state<NestedOuter>()
</script>

<div>
  <button
    data-testid="server-function-trigger"
    onclick={() =>
      serverFnReturningNested().then((res) => (nestedResponse = res))}
  >
    trigger
  </button>

  {#if nestedResponse}
    <RenderNestedData nested={nestedResponse} />
  {:else}
    <div data-testid="waiting-for-response">waiting for response...</div>
  {/if}
</div>
