<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import NotFound from '~/components/NotFound.svelte'
  import RootError from '~/components/RootError.svelte'
  import appCss from '~/styles/app.css?url'
  import { seo } from '~/utils/seo'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        {
          charset: 'utf-8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        ...seo({
          title: 'TanStack Website',
          description: `TanStack projects are type-safe!!!`,
        }),
      ],
      links: [
        { rel: 'stylesheet', href: appCss },
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
        { rel: 'icon', href: '/favicon.ico' },
      ],
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
