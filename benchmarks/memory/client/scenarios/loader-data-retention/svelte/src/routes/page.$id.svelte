<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createLoaderData } from '../../../loader-data'

  export const Route = createFileRoute('/page/$id')({
    loader: ({ params }: { params: { id: string } }) =>
      createLoaderData(params.id),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main
  data-bench-count={data.current.records.length}
  data-bench-id={data.current.id}
  data-bench-page="page"
>
  {`${data.current.id}:${data.current.records.length}`}
</main>
