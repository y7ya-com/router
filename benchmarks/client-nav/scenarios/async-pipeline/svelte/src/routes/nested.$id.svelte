<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { deferredHops, hopDelay, nestedStateValue } from '../../../shared'

  export const Route = createFileRoute('/nested/$id')({
    staleTime: 0,
    gcTime: 0,
    loader: async ({ params }) => {
      await hopDelay(deferredHops)
      return { value: nestedStateValue(params.id) }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div data-testid="nested-state">{data.current.value}</div>
