<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/photos/$photoId')()
</script>

<script lang="ts">
  import { photoLabel } from '../../../shared'

  const params = Route.useParams()
</script>

<main>
  <h1 data-testid="photo-state">{photoLabel(params.current.photoId)}</h1>
</main>
