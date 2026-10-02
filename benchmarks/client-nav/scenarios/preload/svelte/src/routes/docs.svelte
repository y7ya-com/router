<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/docs')()
</script>

<script lang="ts">
  import { docsMarker } from '../../../shared'
</script>

<main>
  <p data-testid="page-state">{docsMarker}</p>
</main>
