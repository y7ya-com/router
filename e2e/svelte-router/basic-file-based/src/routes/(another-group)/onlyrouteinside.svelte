<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  export const Route = createFileRoute('/(another-group)/onlyrouteinside')({
    validateSearch: z.object({ hello: z.string().optional() }),
  })
</script>

<script lang="ts">
  import { useSearch, getRouteApi } from '@tanstack/svelte-router'

  const routeApi = getRouteApi('/(another-group)/onlyrouteinside')

  const searchViaHook = useSearch({ from: '/(another-group)/onlyrouteinside' })
  const searchViaRouteHook = Route.useSearch()
  const searchViaRouteApi = routeApi.useSearch()
</script>

<div>
  <div data-testid="search-via-hook">{searchViaHook.current.hello}</div>
  <div data-testid="search-via-route-hook">
    {searchViaRouteHook.current.hello}
  </div>
  <div data-testid="search-via-route-api">
    {searchViaRouteApi.current.hello}
  </div>
</div>
