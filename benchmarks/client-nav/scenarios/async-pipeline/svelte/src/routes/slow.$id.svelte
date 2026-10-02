<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { deferredHops, hopDelay, slowStateValue } from '../../../shared'

  export const Route = createFileRoute('/slow/$id')({
    staleTime: 0,
    gcTime: 0,
    loader: async ({ params }) => {
      await hopDelay(deferredHops)
      return { value: slowStateValue(params.id) }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div data-testid="slow-state">{data.current.value}</div>
