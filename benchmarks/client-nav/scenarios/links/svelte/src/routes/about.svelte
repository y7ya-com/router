<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/about')()
</script>

<script lang="ts">
  import { aboutMarker } from '../../../shared'
</script>

<main>
  <p data-testid="page-state">{aboutMarker}</p>
</main>
