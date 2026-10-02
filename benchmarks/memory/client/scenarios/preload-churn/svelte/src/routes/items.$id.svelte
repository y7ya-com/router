<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createItemPayload, trackItemLoaderCall } from '../../../item-payload'

  export const Route = createFileRoute('/items/$id')({
    loader: ({ params }: { params: { id: string } }) => {
      trackItemLoaderCall(params.id)
      return createItemPayload(params.id)
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench-id={data.current.id} data-bench-page="item">
  {`${data.current.id}:${data.current.byteLength}`}
</main>
