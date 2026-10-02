<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { getSlowLoaderDeferred } from '../../../slow-loaders'

  export const Route = createFileRoute('/slow/$id')({
    loader: async ({ params }: { params: { id: string } }) => {
      const deferred = getSlowLoaderDeferred(params.id)

      return await deferred.promise
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-id={data.current.id} data-bench-page="slow">
  {`${data.current.kind}:${data.current.id}:${data.current.ts}`}
</main>
