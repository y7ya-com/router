<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/target')()
</script>

<div data-testid="target-state">target</div>
