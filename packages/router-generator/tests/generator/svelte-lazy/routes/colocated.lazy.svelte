<script module lang="ts">
  import { createLazyFileRoute } from '@tanstack/svelte-router'
  import Pending from './-pending.svelte'

  export const Route = createLazyFileRoute('/colocated')({
    pendingComponent: Pending,
  })
</script>

<div>colocated component</div>
