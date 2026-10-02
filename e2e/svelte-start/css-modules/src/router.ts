import { createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: false,
  })

  return router
}
