<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'
  import { ssrSchema } from '~/search'
  import RootDocument from '../components/RootDocument.svelte'
  import appCss from '~/styles/app.css?url'
  export const Route = createRootRoute({
    head: () => ({
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title: 'Selective SSR E2E Test' },
      ],
      links: [{ rel: 'stylesheet', href: appCss }],
    }),
    validateSearch: z.object({ root: ssrSchema }),
    ssr: ({ search }) => {
      if (typeof window !== 'undefined') {
        const error = `ssr() for ${Route.id} should not be called on the client`
        console.error(error)
        throw new Error(error)
      }
      if (search.status === 'success') {
        return search.value.root?.ssr
      }
    },
    beforeLoad: ({ search }) => {
      console.log(
        `beforeLoad for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      if (
        search.root?.expected?.data === 'client' &&
        typeof window === 'undefined'
      ) {
        const error = `Expected beforeLoad for ${Route.id} to be executed on the client, but it is running on the server`
        console.error(error)
        throw new Error(error)
      }
      return {
        root: typeof window === 'undefined' ? 'server' : 'client',
        search,
      }
    },
    loader: ({ context }) => {
      console.log(
        `loader for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      if (
        context.search.root?.expected?.data === 'client' &&
        typeof window === 'undefined'
      ) {
        const error = `Expected loader for ${Route.id} to be executed on the client, but it is running on the server`
        console.error(error)
        throw new Error(error)
      }
      return { root: typeof window === 'undefined' ? 'server' : 'client' }
    },
    shellComponent: RootDocument,
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const search = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const context = Route.useRouteContext()

  if (
    typeof window === 'undefined' &&
    search.current.root?.expected?.render === 'client-only'
  ) {
    const error = `Expected component for ${Route.id} to be executed on the client, but it is running on the server`
    console.error(error)
    throw new Error(error)
  }
</script>

<div data-testid="root-container">
  <h2 data-testid="root-heading">root</h2>
  <div>
    ssr: <b>{JSON.stringify(search.current.root?.ssr ?? 'undefined')}</b>
  </div>
  <div>
    expected data location execution:
    <b data-testid="root-data-expected">{search.current.root?.expected?.data}</b
    >
  </div>
  <div>
    loader: <b data-testid="root-loader">{loaderData.current.root}</b>
  </div>
  <div>
    context: <b data-testid="root-context">{context.current.root}</b>
  </div>
  <hr />
  <Outlet />
</div>
