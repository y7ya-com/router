<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'application-name', content: 'SSR head benchmark' },
        { name: 'description', content: 'Head-heavy SSR benchmark scenario' },
        { name: 'theme-color', content: '#111827' },
        { property: 'og:type', content: 'website' },
      ],
    }),
    validateSearch: (s) => s as { q?: string },
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
