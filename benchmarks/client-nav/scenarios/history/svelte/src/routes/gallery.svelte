<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/gallery')()
</script>

<main>
  <h1 data-testid="gallery-state">Gallery</h1>
</main>
