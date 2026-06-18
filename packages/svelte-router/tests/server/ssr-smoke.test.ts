import { expect, test } from 'vitest'
import { createRequestHandler, renderRouterToString } from '../../src/ssr/server'
import { createRootRoute, createRoute, createRouter } from '../../src'
import Hello from './fixtures/Hello.svelte'

test('renderRouterToString server-renders route content + dehydrated state', async () => {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Hello as any,
  })
  const handler = createRequestHandler({
    request: new Request('http://localhost/'),
    createRouter: () =>
      createRouter({ routeTree: rootRoute.addChildren([indexRoute]) }),
  })
  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({ responseHeaders, router }),
  )
  const html = await response.text()
  expect(html).toContain('<!DOCTYPE html>')
  expect(html).toContain('$_TSR.router')
  expect(html).toContain('Hello from SSR') // ← route content now server-rendered
})

test('nested route renders through Outlet on the server', async () => {
  const { default: Layout } = await import('./fixtures/Layout.svelte')
  const { default: Child } = await import('./fixtures/Child.svelte')
  const rootRoute = createRootRoute({ component: Layout as any })
  const childRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Child as any,
  })
  const handler = createRequestHandler({
    request: new Request('http://localhost/'),
    createRouter: () =>
      createRouter({ routeTree: rootRoute.addChildren([childRoute]) }),
  })
  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({ responseHeaders, router }),
  )
  const html = await response.text()
  expect(html).toContain('Layout')
  expect(html).toContain('Child content from SSR') // ← rendered through <Outlet />
})
