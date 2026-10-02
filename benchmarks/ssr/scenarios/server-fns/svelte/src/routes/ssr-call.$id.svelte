<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { echoGet } from '../fns'

  export const Route = createFileRoute('/ssr-call/$id')({
    loader: async ({ params }) => {
      const result = await echoGet({
        data: {
          q: `ssr-${params.id}`,
          n: 300,
          nested: { list: [`ssr-call-${params.id}`] },
        },
      })

      return { marker: result.list[0] }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main data-bench="server-fn-ssr-call">{data.current.marker}</main>
