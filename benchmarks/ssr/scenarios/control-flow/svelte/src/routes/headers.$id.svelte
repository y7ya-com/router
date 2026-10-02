<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/headers/$id')({
    headers: ({ params }) => ({
      'x-bench-route-header': `route-header-${params.id}`,
      'x-bench-route-static': 'control-flow-route-headers',
    }),
  })
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<main>{`headers-${params.current.id}`}</main>
