<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/special|pipe')()
</script>

<div data-testid="special-pipe-route-heading">Hello "/special|pipe"!</div>
