// @vitest-environment node
/**
 * `renderRouterToStream`: the document goes out first, then the router's
 * dehydration payload — deferred loader promises included, as they resolve.
 */
import { expect, test } from 'vitest'
import {
  Await,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  useLoaderData,
} from '@tanstack/svelte-router'
import {
  createRequestHandler,
  renderRouterToStream,
} from '@tanstack/svelte-router/ssr/server'

async function readChunks(response: Response) {
  const reader = response.body!.getReader()
  const decoder = new TextDecoder()
  const chunks: Array<string> = []
  for (;;) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    chunks.push(decoder.decode(value))
  }
  return chunks
}

test('streams deferred loader data after the document', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => ({
      later: new Promise<string>((resolve) =>
        setTimeout(() => resolve('deferred-value'), 30),
      ),
    }),
    component: () => {
      const data = useLoaderData({ from: '/' })
      return (
        <div>
          <Await
            promise={data.current.later}
            fallback={() => <span>loading</span>}
          >
            {(value: string) => <span>{value}</span>}
          </Await>
        </div>
      )
    },
  })

  const request = new Request('http://localhost/')
  const handler = createRequestHandler({
    request,
    createRouter: () => createRouter({ routeTree: root.addChildren([index]) }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToStream({ request, responseHeaders, router }),
  )
  expect(response.status).toBe(200)

  const chunks = await readChunks(response)
  const html = chunks.join('')
  expect(html).toContain('<span>loading</span>')
  expect(html).toContain('deferred-value')
  // The rendered markup (fallback included) precedes the deferred chunk,
  // which router-core injects ahead of the held-back `</body></html>` tail.
  expect(html.indexOf('deferred-value')).toBeGreaterThan(
    html.indexOf('loading'),
  )
  expect(html.trimEnd().endsWith('</body></html>')).toBe(true)
  expect(chunks.length).toBeGreaterThan(1)
})

test('a thrown redirect in a loader still produces the redirect response', async () => {
  const { redirect } = await import('@tanstack/svelte-router')
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw redirect({ to: '/there' })
    },
  })
  const there = createRoute({ getParentRoute: () => root, path: 'there' })
  const request = new Request('http://localhost/')
  const handler = createRequestHandler({
    request,
    createRouter: () =>
      createRouter({ routeTree: root.addChildren([index, there]) }),
  })
  const response = await handler(({ responseHeaders, router }: any) =>
    renderRouterToStream({ request, responseHeaders, router }),
  )
  expect(response.status).toBe(307)
  expect(response.headers.get('Location')).toBe('/there')
})
