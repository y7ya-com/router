<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeLevelData } from '../../../../loaders/shared-data'

  export const Route = createFileRoute('/mix/$a/$b/$c')({
    ssr: false,
    loader: async ({ params }) => {
      return {
        marker: `level-c-loader-${params.c}`,
        data: makeLevelData(`level-c-data-${params.c}`, 3),
      }
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
  const params = Route.useParams()
</script>

<section>
  <h2>{`csr-rendered-${params.current.c}`}</h2>
  <p>{data.current.marker}</p>
</section>
