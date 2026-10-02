<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { makeLevelData } from '../../../shared-data'

  export const Route = createFileRoute('/$a/$b')({
    beforeLoad: ({ params, context }) => {
      void context

      return { ctxB: `v-${params.b}` }
    },
    loaderDeps: ({ search }) => ({ page: search.page }),
    loader: async ({ params, deps, context }) => {
      void context

      return makeLevelData(params.b, deps.page)
    },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<section>
  <h2>{data.current.meta.label}</h2>
  <ul>
    {#each data.current.items.slice(0, 10) as item (item.id)}
      <li>{item.name}</li>
    {/each}
  </ul>
  <Outlet />
</section>
