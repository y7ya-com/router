<script module lang="ts">
  import { createFileRoute, notFound } from '@tanstack/svelte-router'
  import MissingNotFound from '../components/MissingNotFound.svelte'

  export const Route = createFileRoute('/missing/$id')({
    staleTime: 0,
    gcTime: 0,
    loader: ({ params }) => {
      if (params.id === 'gone') {
        throw notFound()
      }
      return { id: params.id }
    },
    notFoundComponent: MissingNotFound,
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div data-testid="missing-state">{data.current.id}</div>
