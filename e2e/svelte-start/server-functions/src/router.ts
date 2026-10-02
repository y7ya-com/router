import { createRouter } from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { QueryClient } from '@tanstack/svelte-query'
import { routeTree } from './routeTree.gen'
import DefaultCatchBoundary from './components/DefaultCatchBoundary.svelte'
import NotFound from './components/NotFound.svelte'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
    context: {
      foo: {
        bar: 'baz',
      },
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
