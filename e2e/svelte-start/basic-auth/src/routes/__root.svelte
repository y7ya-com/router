<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'

  import DefaultCatchBoundary from '~/components/DefaultCatchBoundary.svelte'
  import NotFound from '~/components/NotFound.svelte'
  import RootShell from '~/components/RootShell.svelte'
  import appCss from '~/styles/app.css?url'
  import { seo } from '~/utils/seo.js'
  import { useAppSession } from '~/utils/session.js'

  const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
    // We need to auth on the server so we have access to secure cookies
    const session = await useAppSession()

    if (!session.data.userEmail) {
      return null
    }

    return {
      email: session.data.userEmail,
    }
  })

  export const Route = createRootRoute({
    beforeLoad: async () => {
      const user = await fetchUser()

      return {
        user,
      }
    },
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
          title:
            'TanStack Start | Type-Safe, Client-First, Full-Stack Svelte Framework',
          description: `TanStack Start is a type-safe, client-first, full-stack Svelte framework.`,
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
    shellComponent: RootShell,
    errorComponent: DefaultCatchBoundary,
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
