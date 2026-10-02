import { mount } from 'svelte'
import { createRouter } from '@tanstack/svelte-router'
import { QueryClient } from '@tanstack/svelte-query'
import App from './App.svelte'
import { routeTree } from './routeTree.gen'
import './styles.css'

const queryClient = new QueryClient()

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  scrollRestoration: true,
  defaultPreload: 'intent',
  // Since we're using Svelte Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(App, { target: rootElement, props: { router, queryClient } })
}
