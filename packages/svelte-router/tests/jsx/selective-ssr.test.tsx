// @vitest-environment node
/**
 * Server side of selective SSR and the document shell options.
 */
import { expect, test } from 'vitest'
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

async function serve(routeTree: any, url = 'http://localhost/') {
  const request = new Request(url)
  const handler = createRequestHandler({
    request,
    createRouter: () => createRouter({ routeTree }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToString({ responseHeaders, router }),
  )
  return response.text()
}

test('an ssr:false route renders only its pending view on the server', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    ssr: false,
    pendingComponent: () => <p>pending</p>,
    component: () => <p>secret-client-markup</p>,
  })
  const html = await serve(root.addChildren([index]))
  expect(html).toContain('<p>pending</p>')
  expect(html).not.toContain('secret-client-markup')
})

test('htmlAttrs and bodyAttrs reach the document', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    htmlAttrs: { lang: 'en', 'data-theme': 'dark' },
    bodyAttrs: { class: 'app "quoted"' },
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <p>index</p>,
  })
  const html = await serve(root.addChildren([index]))
  expect(html).toContain('<html lang="en" data-theme="dark">')
  expect(html).toContain('<body class="app &quot;quoted&quot;">')
})
