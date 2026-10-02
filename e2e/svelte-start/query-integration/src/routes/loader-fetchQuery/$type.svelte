<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import z from 'zod'
  import { makeQueryOptions } from '~/queryOptions'

  export const Route = createFileRoute('/loader-fetchQuery/$type')({
    params: {
      parse: ({ type }) =>
        z
          .object({
            type: z.union([z.literal('sync'), z.literal('async')]),
          })
          .parse({ type }),
    },
    context: ({ params }) => ({
      queryOptions: makeQueryOptions(`loader-fetchQuery-${params.type}`),
    }),
    loader: ({ context, params }) => {
      const queryPromise = context.queryClient.fetchQuery(context.queryOptions)
      if (params.type === 'sync') {
        return queryPromise
      }
    },
    ssr: 'data-only',
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const loaderData = Route.useLoaderData()
  const context = Route.useRouteContext()
  const query = createQuery(() => context.current.queryOptions)
</script>

<div>
  <div>
    loader data:
    <div data-testid="loader-data">{loaderData.current ?? 'undefined'}</div>
  </div>
  <div>
    query data:
    <div data-testid="query-data">{query.data ?? 'loading...'}</div>
  </div>
</div>
