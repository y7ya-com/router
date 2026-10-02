<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    getGlobalMiddlewareContext,
    makeDocumentMarker,
    type GlobalMiddlewareContext,
  } from '../../../shared'

  export const Route = createFileRoute('/page/$id')({
    beforeLoad: ({ serverContext }) => ({
      globalMiddlewareContext: (serverContext ?? {}) as GlobalMiddlewareContext,
    }),
    loader: ({ params, context }) => ({
      marker: makeDocumentMarker(
        params.id,
        getGlobalMiddlewareContext(context),
      ),
    }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main>{data.current.marker}</main>
