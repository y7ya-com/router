import { createRouter } from '@tanstack/svelte-router'

import { routeTree } from './routeTree.gen'
import './styles.css'

// Set up a Router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}
