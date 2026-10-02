<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import NotFound from '~/components/NotFound.svelte'
  import RootError from '~/components/RootError.svelte'
  import appCss from '~/styles/app.css?url'

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
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
    }),
    errorComponent: RootError,
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'
</script>

<Outlet />
<TanStackRouterDevtools position="bottom-right" />
