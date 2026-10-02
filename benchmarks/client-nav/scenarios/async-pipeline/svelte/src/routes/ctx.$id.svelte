<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import {
    ctxSeedValue,
    ctxStateValue,
    deferredHops,
    hopDelay,
  } from '../../../shared'

  export const Route = createFileRoute('/ctx/$id')({
    staleTime: 0,
    gcTime: 0,
    beforeLoad: async ({ params }) => {
      await hopDelay(deferredHops)
      return { ctxSeed: ctxSeedValue(params.id) }
    },
    loader: ({ params, context }) => {
      if (context.ctxSeed !== ctxSeedValue(params.id)) {
        throw new Error('beforeLoad context missing in loader')
      }
      return { value: ctxStateValue(params.id) }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<div data-testid="ctx-state">{data.current.value}</div>
