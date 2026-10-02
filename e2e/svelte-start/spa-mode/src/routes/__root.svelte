<script module lang="ts">
  import { createRawSnippet } from 'svelte'
  import { createRootRoute } from '@tanstack/svelte-router'
  import RootDocument from '../components/RootDocument.svelte'
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
          title: 'SPA Mode E2E Test',
        },
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
    }),
    beforeLoad: () => {
      console.log(
        `beforeLoad for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      return {
        root: typeof window === 'undefined' ? 'server' : 'client',
      }
    },
    loader: () => {
      console.log(
        `loader for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      return { root: typeof window === 'undefined' ? 'server' : 'client' }
    },
    shellComponent: RootDocument,
    pendingComponent: createRawSnippet(() => ({
      render: () => '<div>__root Loading...</div>',
    })),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const loaderData = Route.useLoaderData()
  const context = Route.useRouteContext()
</script>

<div data-testid="root-container">
  <h2 data-testid="root-heading">root</h2>
  <div>
    loader: <b data-testid="root-loader">{loaderData.current.root}</b>
  </div>
  <div>
    context: <b data-testid="root-context">{context.current.root}</b>
  </div>
  <hr />
  <Outlet />
</div>
