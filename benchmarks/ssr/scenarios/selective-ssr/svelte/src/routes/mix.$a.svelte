<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeLevelData } from '../../../../loaders/shared-data'

  export const Route = createFileRoute('/mix/$a')({
    ssr: true,
    loader: async ({ params }) => {
      return makeLevelData(`level-a-loader-${params.a}`, 1)
    },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
  const params = Route.useParams()
</script>

<section>
  <h2>{`level-a-rendered-${params.current.a}`}</h2>
  <p>{data.current.items[0]?.name}</p>
  <Outlet />
</section>
