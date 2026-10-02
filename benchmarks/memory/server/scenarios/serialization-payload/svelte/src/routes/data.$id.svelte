<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeSerializationPayload } from '../../../serialization-payload'

  export const Route = createFileRoute('/data/$id')({
    loader: ({ params }) => makeSerializationPayload(params.id),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench="serialization-payload">
  Map size: {data.current.lookup.size}
</main>
