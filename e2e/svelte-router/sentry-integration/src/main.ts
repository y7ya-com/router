import { mount } from 'svelte'

import * as Sentry from '@sentry/svelte'
import { tanstackRouterBrowserTracingIntegration } from './tanstackrouter'

import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import RootComponent from './components/RootComponent.svelte'
import RootNotFound from './components/RootNotFound.svelte'
import IndexComponent from './components/IndexComponent.svelte'
import './styles.css'

const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: RootNotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
})

const routeTree = rootRoute.addChildren([indexRoute])

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

Sentry.init({
  dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  integrations: [tanstackRouterBrowserTracingIntegration(router)],
  transport: () => ({
    send: (): Promise<any> => Promise.resolve(),
    flush: () => Promise.resolve(true),
  }),
  tracesSampleRate: 0.2,
  sendClientReports: false,
})

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
