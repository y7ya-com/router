import { mount } from 'svelte'
import { createRouter } from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import App from './App.svelte'
import { routeTree } from './routeTree.gen'
import NotFound from './NotFound.svelte'
import ErrorPanel from './ErrorPanel.svelte'
import { queryClient } from './query-client'

const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultNotFoundComponent: NotFound,
  notFoundMode: 'fuzzy',
  defaultErrorComponent: ErrorPanel,
})

// Wire TanStack Query into the router: dehydrate/hydrate the cache across the
// SSR boundary and provide the QueryClient to the whole route tree.
setupRouterSsrQueryIntegration({ router, queryClient })

declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const target = document.getElementById('app')
if (!target) throw new Error('No #app element found')

mount(App, { target, props: { router } })
