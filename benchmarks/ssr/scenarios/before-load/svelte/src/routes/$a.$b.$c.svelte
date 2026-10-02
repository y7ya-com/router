<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeBeforeLoadMarker, type BeforeLoadContext } from '../../../shared'

  export const Route = createFileRoute('/$a/$b/$c')({
    beforeLoad: ({ params, context }) => {
      const parent = context as BeforeLoadContext

      return {
        chainToken: `${parent.chainToken}.${params.c}`,
        ctxC: params.c,
      }
    },
    loader: ({ context }) => ({
      marker: makeBeforeLoadMarker(context as BeforeLoadContext),
    }),
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<main>{data.current.marker}</main>
