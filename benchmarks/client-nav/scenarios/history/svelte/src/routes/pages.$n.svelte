<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/pages/$n')()
</script>

<script lang="ts">
  import { pageLabel } from '../../../shared'

  const params = Route.useParams()
</script>

<main>
  <h1 data-testid="page-state">{pageLabel(params.current.n)}</h1>
</main>
