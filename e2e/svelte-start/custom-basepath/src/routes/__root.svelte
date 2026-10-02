<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import NotFound from '~/components/NotFound.svelte'
  import RootErrorComponent from '~/components/RootErrorComponent.svelte'
  import appCss from '~/styles/app.css?url'
  import { seo } from '~/utils/seo'

  export const Route = createRootRoute({
    head: () => ({
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        ...seo({
          title:
            'TanStack Start | Type-Safe, Client-First, Full-Stack Svelte Framework',
          description: `TanStack Start is a type-safe, client-first, full-stack Svelte framework. `,
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
    errorComponent: RootErrorComponent,
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { TanStackRouterDevtoolsInProd } from '@tanstack/svelte-router-devtools'
</script>

<div class="p-2 flex gap-2 text-lg">
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>{' '}
  <Link
    to="/posts"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Posts
  </Link>{' '}
  <Link
    to="/users"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Users
  </Link>{' '}
  <Link
    to="/deferred"
    activeProps={{
      class: 'font-bold',
    }}
  >
    Deferred
  </Link>{' '}
  <Link
    to={'/this-route-does-not-exist' as any}
    activeProps={{
      class: 'font-bold',
    }}
  >
    This Route Does Not Exist
  </Link>
</div>
<Outlet />
<TanStackRouterDevtoolsInProd />
