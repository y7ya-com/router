import { createRouter as createSvelteRouter } from '@tanstack/svelte-router'
import { QueryClient } from '@tanstack/svelte-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function createRouter() {
  // A fresh QueryClient per call — important on the server, where each request
  // must get its own cache (no cross-request leakage). On the client this runs
  // once. The integration dehydrates this cache on the server and hydrates it
  // on the client.
  const queryClient = new QueryClient()

  const router = createSvelteRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
