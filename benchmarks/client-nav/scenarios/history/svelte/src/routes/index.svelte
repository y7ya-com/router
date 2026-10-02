<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<main>
  <h1 data-testid="home-state">Home</h1>
</main>
