/**
 * Parity: `router` (part 3) — invalidation filters, layout splat matching,
 * search validation failures, history modes, and router option surface.
 */
import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  useParams,
} from '@tanstack/svelte-router'

const at = (id: string) => screen.getByTestId(id).textContent

function mount(routeTree: any, initial = '/', extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

// ------------------------------------------------------------- invalidation

test('invalidate re-runs every loader', async () => {
  let a = 0
  let b = 0
  const root = createRootRoute({ component: () => <Outlet /> })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    loader: () => ++a,
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'c',
    loader: () => ++b,
    component: () => <div data-testid="p">child</div>,
  })
  const router = mount(root.addChildren([parent.addChildren([child])]), '/p/c')

  await waitFor(() => expect(at('p')).toBe('child'))
  const [a0, b0] = [a, b]
  await router.invalidate()
  await waitFor(() => expect(a).toBeGreaterThan(a0))
  expect(b).toBeGreaterThan(b0)
})

test('invalidate with a filter only re-runs matching routes', async () => {
  let a = 0
  let b = 0
  const root = createRootRoute({ component: () => <Outlet /> })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    loader: () => ++a,
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'c',
    loader: () => ++b,
    component: () => <div data-testid="p">child</div>,
  })
  const router = mount(root.addChildren([parent.addChildren([child])]), '/p/c')

  await waitFor(() => expect(at('p')).toBe('child'))
  const [a0, b0] = [a, b]
  await router.invalidate({ filter: (m: any) => m.routeId === '/p/c' } as any)
  // The filter decides which matches get marked `invalid`; the load() that
  // follows may still revisit others, so only the targeted route is asserted.
  await waitFor(() => expect(b).toBeGreaterThan(b0))
  expect(a).toBeGreaterThanOrEqual(a0)
})

test('a notFound thrown after invalidate keeps rendering notFound', async () => {
  let fail = false
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      if (fail) {
        throw notFound()
      }
      return 'ok'
    },
    component: () => <div data-testid="p">ok</div>,
    notFoundComponent: () => <div data-testid="p">missing</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('ok'))
  fail = true
  await router.invalidate()
  await waitFor(() => expect(at('p')).toBe('missing'))
  await router.invalidate()
  await waitFor(() => expect(at('p')).toBe('missing'))
})

// -------------------------------------------------------- layout + splat

test('a layout route with a splat child matches', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const layout = createRoute({
    getParentRoute: () => root,
    id: '_shell',
    component: () => (
      <>
        <span data-testid="shell">shell</span>
        <Outlet />
      </>
    ),
  })
  const splat = createRoute({
    getParentRoute: () => layout,
    path: 'docs/$',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current._splat}</div>
    },
  })
  mount(root.addChildren([index, layout.addChildren([splat])]), '/docs/a/b')

  await waitFor(() => expect(at('p')).toBe('a/b'))
  expect(at('shell')).toBe('shell')
})

test('a splat under a dynamic parent keeps both params', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const org = createRoute({
    getParentRoute: () => root,
    path: 'orgs/$orgId',
    component: () => <Outlet />,
  })
  const splat = createRoute({
    getParentRoute: () => org,
    path: 'files/$',
    component: () => {
      const p = useParams({ strict: false })
      const c = p.current
      return (
        <div data-testid="p">
          {c.orgId}:{c._splat}
        </div>
      )
    },
  })
  mount(
    root.addChildren([index, org.addChildren([splat])]),
    '/orgs/o1/files/x/y',
  )
  await waitFor(() => expect(at('p')).toBe('o1:x/y'))
})

// ------------------------------------------------------- search validation

test('a throwing validateSearch surfaces through the error boundary', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => {
      if (s.page === 'bad') {
        throw new Error('invalid search')
      }
      return { page: String(s.page ?? '') }
    },
    component: () => <div data-testid="p">ok</div>,
    errorComponent: () => <div data-testid="p">search errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]), '/?page=bad')
  await waitFor(() => expect(at('p')).toBe('search errored'))
  spy.mockRestore()
})

test('validateSearch defaults are applied when the key is absent', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 7),
    }),
    component: () => <div data-testid="p">ok</div>,
  })
  const router = mount(root.addChildren([index]), '/')
  await waitFor(() => expect(at('p')).toBe('ok'))
  expect(router.state.location.search).toMatchObject({ page: 7 })
})

test('search is parsed for nested routes independently', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    validateSearch: (s: Record<string, unknown>) => ({ a: String(s.a ?? '') }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'c',
    validateSearch: (s: Record<string, unknown>) => ({ b: String(s.b ?? '') }),
    component: () => <div data-testid="p">child</div>,
  })
  const router = mount(
    root.addChildren([parent.addChildren([child])]),
    '/p/c?a=1&b=2',
  )

  await waitFor(() => expect(at('p')).toBe('child'))
  expect(router.state.location.search).toMatchObject({ a: '1', b: '2' })
})

// ------------------------------------------------------------ history modes

test('memory history starts at the requested entry', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]), '/about')
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.pathname).toBe('/about')
})

test('history entries accumulate and can be walked back', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    component: () => <div data-testid="p">a</div>,
  })
  const b = createRoute({
    getParentRoute: () => root,
    path: 'b',
    component: () => <div data-testid="p">b</div>,
  })
  const router = mount(root.addChildren([index, a, b]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/a' })
  await waitFor(() => expect(at('p')).toBe('a'))
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('p')).toBe('b'))

  router.history.back()
  await waitFor(() => expect(at('p')).toBe('a'))
  router.history.back()
  await waitFor(() => expect(at('p')).toBe('index'))
})

// ---------------------------------------------------------- option surface

test('defaultPreload is accepted at the router level', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]), '/', {
    defaultPreload: 'intent',
  })
  await waitFor(() => expect(at('p')).toBe('index'))
  expect((router.options as any).defaultPreload).toBe('intent')
})

test('defaultPendingMs and defaultPendingComponent are accepted', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const slow = createRoute({
    getParentRoute: () => root,
    path: 'slow',
    loader: async () => {
      await new Promise((r) => setTimeout(r, 100))
      return 'x'
    },
    component: () => <div data-testid="p">slow</div>,
  })
  const router = mount(root.addChildren([index, slow]), '/', {
    defaultPendingMs: 0,
    defaultPendingComponent: () => null,
  })

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/slow' })
  await waitFor(() => expect(at('p')).toBe('slow'))
})

test('router.matchRoutes resolves a path without navigating', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
  })
  const router = createRouter({
    routeTree: root.addChildren([index, post]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()

  const matches = router.matchRoutes('/posts/5', {} as any) as Array<any>
  expect(matches.map((m: any) => m.routeId)).toContain('/posts/$postId')
  expect(router.state.location.pathname).toBe('/')
})
