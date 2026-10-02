import { QueryClient } from '@tanstack/svelte-query'
import { createRouter } from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { routeTree } from './routeTree.gen'
import DefaultCatchBoundary from './components/DefaultCatchBoundary.svelte'
import NotFound from './components/NotFound.svelte'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })
  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
