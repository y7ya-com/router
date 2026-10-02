<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootDocument from '~/components/RootDocument.svelte'
  import NotFound from '~/components/NotFound.svelte'
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
        {
          title: 'Serialization Adapters E2E Test',
        },
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
    }),
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
