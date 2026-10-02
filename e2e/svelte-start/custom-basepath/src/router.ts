import { createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'
import DefaultCatchBoundary from './components/DefaultCatchBoundary.svelte'
import NotFound from './components/NotFound.svelte'
import { basepath } from './utils/basepath'

export function getRouter() {
  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: DefaultCatchBoundary,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
    basepath: basepath,
  })

  return router
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
