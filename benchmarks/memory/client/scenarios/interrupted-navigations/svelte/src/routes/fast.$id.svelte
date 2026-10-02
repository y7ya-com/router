<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fixedTimestamp } from '../../../slow-loaders'

  export const Route = createFileRoute('/fast/$id')({
    loader: ({ params }: { params: { id: string } }) => ({
      id: params.id,
      kind: 'fast' as const,
      ts: fixedTimestamp,
    }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-id={data.current.id} data-bench-page="fast">
  {`${data.current.kind}:${data.current.id}:${data.current.ts}`}
</main>
