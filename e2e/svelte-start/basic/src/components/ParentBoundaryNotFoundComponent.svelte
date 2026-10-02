<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'

  let { data: _data }: { data?: unknown } = $props()

  const loaderData = getRouteApi('/not-found/parent-boundary').useLoaderData()
</script>

<div data-testid="parent-boundary-notFound-component">
  <div data-testid="parent-loader-data">
    {loaderData.current.parentLoaderData}
  </div>
</div>
