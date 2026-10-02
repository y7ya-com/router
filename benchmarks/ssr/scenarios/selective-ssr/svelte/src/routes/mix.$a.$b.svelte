<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeLevelData } from '../../../../loaders/shared-data'

  export const Route = createFileRoute('/mix/$a/$b')({
    ssr: 'data-only',
    loader: async ({ params }) => {
      return {
        marker: `level-b-loader-${params.b}`,
        data: makeLevelData(`level-b-data-${params.b}`, 2),
      }
    },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
  const params = Route.useParams()
</script>

<section>
  <h2>{`data-only-rendered-${params.current.b}`}</h2>
  <p>{data.current.marker}</p>
  <Outlet />
</section>
