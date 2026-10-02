<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<script lang="ts">
  import { homeMarker } from '../../../shared'
</script>

<main>
  <p data-testid="page-state">{homeMarker}</p>
</main>
