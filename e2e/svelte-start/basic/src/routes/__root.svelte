<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import NotFound from '~/components/NotFound.svelte'
  import RootDocument from '~/components/RootDocument.svelte'
  import RootErrorComponent from '~/components/RootErrorComponent.svelte'
  import '~/styles/app.css'
  import { seo } from '~/utils/seo'

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
        ...seo({
          title:
            'TanStack Start | Type-Safe, Client-First, Full-Stack Svelte Framework',
          description: `TanStack Start is a type-safe, client-first, full-stack Svelte framework. `,
        }),
      ],
      links: [
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
      styles: [
        {
          media: 'all and (min-width: 500px)',
          children: `
        .inline-div {
          color: white;
          background-color: gray;
          max-width: 250px;
        }`,
        },
      ],
    }),
    errorComponent: RootErrorComponent,
    notFoundComponent: NotFound,
    shellComponent: RootDocument,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<Outlet />
