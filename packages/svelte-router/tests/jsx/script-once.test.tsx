// @vitest-environment node
/**
 * `ScriptOnce` emits its source as a self-removing inline script during SSR
 * and renders nothing on the client, like the React and Solid components.
 */
import { expect, test } from 'vitest'
import {
  Outlet,
  ScriptOnce,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import {
  createRequestHandler,
  renderRouterToString,
} from '@tanstack/svelte-router/ssr/server'

test('renders a self-removing script on the server', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <div>
        <ScriptOnce children="window.__once = 1" />
      </div>
    ),
  })
  const handler = createRequestHandler({
    request: new Request('http://localhost/'),
    createRouter: () =>
      createRouter({
        routeTree: root.addChildren([index]),
        ssr: { nonce: 'abc' },
      } as any),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToString({ responseHeaders, router }),
  )
  const html = await response.text()
  expect(html).toContain(
    '<script class="$tsr" nonce="abc">window.__once = 1;document.currentScript.remove()</script>',
  )
})
