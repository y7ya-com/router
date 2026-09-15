import { createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'
import ErrorPanel from './components/ErrorPanel.svelte'
import NotFound from './components/NotFound.svelte'

export function getRouter() {
  return createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultErrorComponent: ErrorPanel,
    defaultNotFoundComponent: NotFound,
    scrollRestoration: true,
  })
}

declare module '@tanstack/svelte-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
