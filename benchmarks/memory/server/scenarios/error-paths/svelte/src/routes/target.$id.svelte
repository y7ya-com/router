<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/target/$id')({})
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<main>{`target-${params.current.id}`}</main>
