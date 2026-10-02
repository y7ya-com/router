<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { deferredHops, hopDelay, nestedLayoutValue } from '../../../shared'

  export const Route = createFileRoute('/nested')({
    staleTime: 0,
    gcTime: 0,
    loader: async () => {
      await hopDelay(deferredHops)
      return { value: nestedLayoutValue() }
    },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<section>
  <div data-testid="nested-layout">{data.current.value}</div>
  <Outlet />
</section>
