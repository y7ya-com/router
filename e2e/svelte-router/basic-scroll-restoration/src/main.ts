import { mount } from 'svelte'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import RootComponent from './components/RootComponent.svelte'
import IndexComponent from './components/IndexComponent.svelte'
import AboutComponent from './components/AboutComponent.svelte'
import ByElementComponent from './components/ByElementComponent.svelte'
import FooComponent from './components/FooComponent.svelte'
import BarComponent from './components/BarComponent.svelte'
import './styles.css'

const rootRoute = createRootRoute({
  component: RootComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  loader: () => new Promise<any>((r) => setTimeout(r, 500)),
  component: IndexComponent,
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  loader: () => new Promise<any>((r) => setTimeout(r, 500)),
  component: AboutComponent,
})

const byElementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/by-element',
  loader: () => new Promise<any>((r) => setTimeout(r, 500)),
  component: ByElementComponent,
})

const fooRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/foo',
  loader: () => new Promise<any>((r) => setTimeout(r, 500)),
  component: FooComponent,
})

const barRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bar',
  loader: () => new Promise<any>((r) => setTimeout(r, 500)),
  component: BarComponent,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  byElementRoute,
  fooRoute,
  barRoute,
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  getScrollRestorationKey: (location) => location.pathname,
})

declare global {
  interface Window {
    invokeOrders: Array<string>
  }
}

let invokeOrders: Array<string> = []
let shouldRecordRouterEvents = true

Object.defineProperty(window, 'invokeOrders', {
  configurable: true,
  get: () => invokeOrders,
  set: (next) => {
    invokeOrders = next
    // Tests reset this between navigations; ignore any in-flight events from
    // the previous navigation until the next navigation begins.
    shouldRecordRouterEvents = false
  },
})

router.subscribe('onBeforeLoad', () => {
  shouldRecordRouterEvents = true
})

router.subscribe('onBeforeRouteMount', (event) => {
  if (!shouldRecordRouterEvents) {
    return
  }
  invokeOrders.push(event.type)
})

router.subscribe('onResolved', (event) => {
  if (!shouldRecordRouterEvents) {
    return
  }
  invokeOrders.push(event.type)
})

declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(RouterProvider, { target: rootElement, props: { router } })
}
