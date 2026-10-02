import { createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })

  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
