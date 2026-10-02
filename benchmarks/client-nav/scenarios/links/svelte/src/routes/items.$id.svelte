<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/items/$id')()
</script>

<script lang="ts">
  import { itemMarker } from '../../../shared'

  const params = Route.useParams()
</script>

<main>
  <p data-testid="page-state">{itemMarker(params.current.id)}</p>
</main>
