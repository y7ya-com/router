import { createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'
import DefaultCatchBoundary from './components/DefaultCatchBoundary.svelte'
import NotFound from './components/NotFound.svelte'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
  })

  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
