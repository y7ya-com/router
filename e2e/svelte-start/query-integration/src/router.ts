import { QueryClient } from '@tanstack/svelte-query'
import { createRouter } from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
  })
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  })
  return router
}
