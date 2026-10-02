<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makePlainSerializationData } from '../../../shared-data'

  export const Route = createFileRoute('/plain/$id')({
    loader: ({ params }) => makePlainSerializationData(params.id),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<section>
  <h1>{data.current.label}</h1>
  <p>{data.current.createdAt}</p>
  <p>{data.current.lookup[0]?.[1].label}</p>
  <p>{data.current.tags[0]}</p>
  <p>{data.current.count}</p>
  <p>{data.current.nested[0]?.id}</p>
  <p>{data.current.points[0]?.label}</p>
  <p>{data.current.problem.message}</p>
</section>
