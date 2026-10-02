<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    validateSearch: (s: Record<string, unknown>) => ({
      page: typeof s.page === 'number' ? s.page : 0,
      tags: Array.isArray(s.tags) ? (s.tags as Array<string>) : [],
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
