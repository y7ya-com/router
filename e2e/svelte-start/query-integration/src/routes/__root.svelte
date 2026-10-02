<script module lang="ts">
  import { createRootRouteWithContext } from '@tanstack/svelte-router'
  import type { QueryClient } from '@tanstack/svelte-query'
  import RootDocument from '~/components/RootDocument.svelte'
  import appCss from '~/styles/app.css?url'

  export const Route = createRootRouteWithContext<{
    queryClient: QueryClient
  }>()({
    head: () => ({
      meta: [
        {
          charSet: 'utf-8',
        },
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
    }),
    shellComponent: RootDocument,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
