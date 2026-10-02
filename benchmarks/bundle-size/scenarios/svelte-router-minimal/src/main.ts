import { mount } from 'svelte'
import { RouterProvider, createRouter } from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (!rootElement) {
  throw new Error('Root element `#app` not found')
}
if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
