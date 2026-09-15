<script module lang="ts">
  import { createRootRouteWithContext } from '@tanstack/svelte-router'

  export const Route = createRootRouteWithContext<{ auth: string }>()({})
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
