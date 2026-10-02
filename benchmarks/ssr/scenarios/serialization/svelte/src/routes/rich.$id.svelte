<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeRichSerializationData } from '../../../shared-data'

  export const Route = createFileRoute('/rich/$id')({
    loader: ({ params }) => makeRichSerializationData(params.id),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<section>
  <h1>{data.current.label}</h1>
  <p>{data.current.createdAt.toISOString()}</p>
  <p>{data.current.lookup.get('k0')?.label}</p>
  <p>{Array.from(data.current.tags)[0]}</p>
  <p>{data.current.count.toString()}</p>
  <p>{data.current.nested[0]?.id}</p>
  <p>{data.current.points[0]?.label}</p>
  <p>{data.current.problem.message}</p>
</section>
