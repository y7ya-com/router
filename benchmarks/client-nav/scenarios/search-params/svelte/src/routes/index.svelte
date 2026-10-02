<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<main>
  <h1>Search Params Bench</h1>
  <div data-testid="home-state">home</div>
</main>
