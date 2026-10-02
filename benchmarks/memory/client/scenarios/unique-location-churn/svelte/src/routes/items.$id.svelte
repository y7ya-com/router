<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  type ItemSearch = {
    q: string
  }

  export const Route = createFileRoute('/items/$id')({
    validateSearch: (search: Record<string, unknown>): ItemSearch => ({
      q: typeof search.q === 'string' ? search.q : '',
    }),
    loaderDeps: ({ search }: { search: ItemSearch }) => ({ q: search.q }),
    loader: ({
      params,
      deps,
    }: {
      params: { id: string }
      deps: { q: string }
    }) => ({
      id: params.id,
      q: deps.q,
      checksum: params.id.length + deps.q.length,
    }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-id={data.current.id}>
  {`${data.current.id}:${data.current.q}:${data.current.checksum}`}
</main>
