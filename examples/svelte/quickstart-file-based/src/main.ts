import { mount } from 'svelte'
import { RouterProvider, createRouter } from '@tanstack/svelte-router'
import App from './App.svelte'
import { routeTree } from './routeTree.gen'
import NotFound from './NotFound.svelte'
import ErrorPanel from './ErrorPanel.svelte'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
  // Without a notFoundComponent on the root SFC, the router would render
  // nothing for an unmatched path. `defaultNotFoundComponent` is the
  // fallback for every route in the tree, and `notFoundMode: 'fuzzy'` keeps
  // the closest-matching layout mounted (so the top navigation still shows
  // on the 404 page).
  defaultNotFoundComponent: NotFound,
  notFoundMode: 'fuzzy',
  // Same idea for thrown errors during render / loader execution.
  defaultErrorComponent: ErrorPanel,
})

declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const target = document.getElementById('app')
if (!target) throw new Error('No #app element found')

mount(App, { target, props: { router } })

export { RouterProvider }
