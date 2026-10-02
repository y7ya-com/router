<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootNotFound from '../components/RootNotFound.svelte'

  export const Route = createRootRoute({
    notFoundComponent: RootNotFound,
    validateSearch: (s) => s as { q?: string },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
