<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/$a/$b')({})
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import RouteWorkload from '../workload/RouteWorkload.svelte'
</script>

<RouteWorkload />
<Outlet />
