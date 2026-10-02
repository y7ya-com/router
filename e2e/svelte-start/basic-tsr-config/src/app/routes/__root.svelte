<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          title: 'TanStack Start Starter',
        },
      ],
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<Outlet />
<TanStackRouterDevtools position="bottom-right" />
