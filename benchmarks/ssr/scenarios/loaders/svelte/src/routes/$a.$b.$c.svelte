<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeLevelData } from '../../../shared-data'

  export const Route = createFileRoute('/$a/$b/$c')({
    beforeLoad: ({ params, context }) => {
      void context

      return { ctxC: `v-${params.c}` }
    },
    loaderDeps: ({ search }) => ({ page: search.page }),
    loader: async ({ params, deps, context }) => {
      void context

      return makeLevelData(params.c, deps.page)
    },
  })
</script>

<script lang="ts">
  const data = Route.useLoaderData()
</script>

<section>
  <h2>{data.current.meta.label}</h2>
  <ul>
    {#each data.current.items.slice(0, 10) as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
</section>
