<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import ExampleNotFound from '~/components/ExampleNotFound.svelte'
  import { capitalize, seo } from '~/utils/seo'

  export const Route = createFileRoute(
    '/$project/$version/docs/framework/$framework/examples/$',
  )({
    head: ({ params }) => ({
      meta: seo({
        title: `${capitalize(params._splat || '')} Example | TanStack ${capitalize(params.project)} ${capitalize(params.framework)}`,
      }),
    }),
    notFoundComponent: ExampleNotFound,
  })
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<div class="space-y-2">
  <h4
    data-testid="selected-example-heading"
    class="text-xl font-bold underline"
  >
    {params.current._splat} example
  </h4>
</div>
