<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    validateSearch: (s: Record<string, unknown>) => ({
      _locale: typeof s._locale === 'string' ? s._locale : undefined,
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
