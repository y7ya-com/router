import { mount } from 'svelte'
import {
  RouterProvider,
  createHashHistory,
  createRouter,
} from '@tanstack/svelte-router'
import { routeTree } from './routeTree.gen'
import type { RouterHistory } from '@tanstack/svelte-router'
import './styles.css'

let history: RouterHistory | undefined

if (import.meta.env.VITE_APP_HISTORY === 'hash') {
  history = createHashHistory()
}

// Set up a Router instance
const router = createRouter({
  routeTree,
  history,
  scrollRestoration: true,
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
