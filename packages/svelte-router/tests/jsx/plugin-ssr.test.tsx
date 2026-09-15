// @vitest-environment node
/**
 * SSR. The plugin picks `generate: 'server'` from the Vite environment, so the
 * same TSX compiles to client code under jsdom and server code here.
 *
 * svelte-router's own equivalent needs three separate .svelte fixture files
 * (Hello, Layout, Child). Here they're inline.
 */
import { expect, test } from 'vitest'
import { render as ssrRender } from 'svelte/server'
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import {
  createRequestHandler,
  renderRouterToString,
} from '@tanstack/svelte-router/ssr/server'

function Hello(props: { name: string }) {
  return <div>Hello {props.name}!</div>
}

function WithControlFlow(props: { items: Array<string>; show: boolean }) {
  return (
    <ul>
      {props.show && <li>visible</li>}
      {props.items.map((i: string) => (
        <li>{i}</li>
      ))}
    </ul>
  )
}

test('a TSX component server-renders', () => {
  const out = ssrRender(Hello as any, { props: { name: 'world' } })
  expect(out.body).toContain('Hello world!')
})

test('control flow server-renders', () => {
  const out = ssrRender(WithControlFlow as any, {
    props: { items: ['a', 'b'], show: true },
  })
  expect(out.body).toContain('visible')
  expect(out.body).toContain('a')
  expect(out.body).toContain('b')
})

test('a TSX route component renders through the router on the server', async () => {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>server-rendered route</h1>,
  })

  const handler = createRequestHandler({
    request: new Request('http://localhost/'),
    createRouter: () =>
      createRouter({ routeTree: rootRoute.addChildren([indexRoute]) }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToString({ responseHeaders, router }),
  )
  const html = await response.text()

  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('server-rendered route')
})

// ---------------------------------------------------- parity: renderRouterToStream

test('renderRouterToStream server-renders route content', async () => {
  const { renderRouterToStream } =
    await import('@tanstack/svelte-router/ssr/server')
  const request = new Request('http://localhost/')
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <h1>streamed route</h1>,
  })

  const handler = createRequestHandler({
    request,
    createRouter: () =>
      createRouter({ routeTree: rootRoute.addChildren([indexRoute]) }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToStream({ request, responseHeaders, router }),
  )
  const html = await response.text()
  expect(html).toContain('streamed route')
})

test('SSR renders a nested route through Outlet', async () => {
  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <span>layout</span>
        <Outlet />
      </div>
    ),
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <span>child content</span>,
  })

  const handler = createRequestHandler({
    request: new Request('http://localhost/'),
    createRouter: () =>
      createRouter({ routeTree: rootRoute.addChildren([indexRoute]) }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToString({ responseHeaders, router }),
  )
  const html = await response.text()
  expect(html).toContain('layout')
  expect(html).toContain('child content')
})
