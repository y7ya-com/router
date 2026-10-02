<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeNested } from '~/data'

  export const Route = createFileRoute('/ssr/nested')({
    beforeLoad: () => {
      return { nested: makeNested() }
    },
    loader: ({ context }) => {
      return context
    },
  })
</script>

<script lang="ts">
  import RenderNestedData from '~/components/RenderNestedData.svelte'

  const loaderData = Route.useLoaderData()
</script>

<RenderNestedData nested={loaderData.current.nested} />
