/**
 * Parity: `router` — path/splat param decoding and encoding, nested params,
 * search validation, lifecycle events, and invalidation.
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

function mount(routeTree: any, initial: string, extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

/** Route tree with a `$slug` route that prints its decoded param. */
function slugTree() {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const slug = createRoute({
    getParentRoute: () => root,
    path: 'posts/$slug',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current.slug}</div>
    },
  })
  return root.addChildren([index, slug])
}

/** Route tree with a splat route that prints `_splat`. */
function splatTree() {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const splat = createRoute({
    getParentRoute: () => root,
    path: 'files/$',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current._splat}</div>
    },
  })
  return root.addChildren([index, splat])
}

// ------------------------------------------------------------ param decoding

test.each([
  ['tanner', 'tanner'],
  ['100%25', '100%'],
  ['100%25100', '100%100'],
  ['100%26', '100&'],
  ['100%26100', '100&100'],
  ['%F0%9F%9A%80', '🚀'],
])('params.slug decodes %s to %s', async (encoded, decoded) => {
  mount(slugTree(), `/posts/${encoded}`)
  await waitFor(() => expect(at('p')).toBe(decoded))
})

test('params.slug decodes a path-like slug', async () => {
  mount(
    slugTree(),
    '/posts/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
  )
  await waitFor(() =>
    expect(at('p')).toBe('framework/react/guide/file-based-routing tanstack'),
  )
})

test.each([
  ['tanner', 'tanner'],
  ['%F0%9F%9A%80', '🚀'],
  [
    'framework/react/guide/file-based-routing%20tanstack',
    'framework/react/guide/file-based-routing tanstack',
  ],
])('params._splat decodes %s to %s', async (encoded, decoded) => {
  mount(splatTree(), `/files/${encoded}`)
  await waitFor(() => expect(at('p')).toBe(decoded))
})

test('a splat route matches multiple segments', async () => {
  mount(splatTree(), '/files/a/b/c')
  await waitFor(() => expect(at('p')).toBe('a/b/c'))
})

test('nested path params are all available', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const file = createRoute({
    getParentRoute: () => root,
    path: 'users/$userId/files/$fileId',
    component: () => {
      const p = useParams({ strict: false })
      const c = p.current
      return (
        <div data-testid="p">
          {c.userId}:{c.fileId}
        </div>
      )
    },
  })
  mount(root.addChildren([index, file]), '/users/u1/files/f2')
  await waitFor(() => expect(at('p')).toBe('u1:f2'))
})

test('params are encoded in the resulting URL', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const slug = createRoute({ getParentRoute: () => root, path: 'posts/$slug' })
  const router = mount(root.addChildren([index, slug]), '/')

  await router.navigate({
    to: '/posts/$slug',
    params: { slug: '@jane' } as any,
  })
  await waitFor(() =>
    expect(router.state.location.pathname).toBe('/posts/%40jane'),
  )
})

test('pathParamsAllowedCharacters leaves listed characters unencoded', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const slug = createRoute({ getParentRoute: () => root, path: 'posts/$slug' })
  const router = mount(root.addChildren([index, slug]), '/', {
    pathParamsAllowedCharacters: ['@'],
  })

  await router.navigate({ to: '/posts/$slug', params: { slug: 'a@b' } as any })
  await waitFor(() => expect(router.state.location.pathname).toBe('/posts/a@b'))
})

// ----------------------------------------------------------------- matching

test('the index route matches the root path', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]), '/')
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(router.state.matches.map((m: any) => m.routeId)).toEqual([
    '__root__',
    '/',
  ])
})

test('an unmatched path renders the notFound component', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">nothing here</div>,
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]), '/does-not-exist')
  await waitFor(() => expect(at('p')).toBe('nothing here'))
})

test('a nested search route matches and validates', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'nested-search',
    validateSearch: (s: Record<string, unknown>) => ({
      foo: String(s.foo ?? ''),
    }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'child',
    validateSearch: (s: Record<string, unknown>) => ({
      bar: String(s.bar ?? ''),
    }),
    component: () => <div data-testid="p">ok</div>,
  })
  const router = mount(
    root.addChildren([index, parent.addChildren([child])]),
    '/nested-search/child?foo=hello&bar=world',
  )

  await waitFor(() => expect(at('p')).toBe('ok'))
  expect(router.state.location.search).toMatchObject({
    foo: 'hello',
    bar: 'world',
  })
})

test('a valid search param does not throw', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => {
      if (s.page !== undefined && Number.isNaN(Number(s.page))) {
        throw new Error('bad search')
      }
      return { page: Number(s.page ?? 1) }
    },
    component: () => <div data-testid="p">ok</div>,
  })
  mount(root.addChildren([index]), '/?page=2')
  await waitFor(() => expect(at('p')).toBe('ok'))
})

// ------------------------------------------------------------------- events

test('emits onResolved during initial load', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const onResolved = vi.fn()
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.subscribe('onResolved', onResolved)
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1))
})

test('emits onResolved again after a navigation', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const onResolved = vi.fn()
  const router = createRouter({
    routeTree: root.addChildren([index, about]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.subscribe('onResolved', onResolved)
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(onResolved).toHaveBeenCalledTimes(2)
})

test('emits onBeforeRouteMount before onResolved', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const order: Array<string> = []
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.subscribe('onBeforeRouteMount', () => order.push('mount'))
  router.subscribe('onResolved', () => order.push('resolved'))
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(order).toEqual(['mount', 'resolved']))
})

// -------------------------------------------------------------- invalidation

test('routes become valid again after invalidate', async () => {
  let runs = 0
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => ++runs,
    component: () => <div data-testid="p">runs</div>,
  })
  const router = mount(root.addChildren([index]), '/')

  await waitFor(() => expect(at('p')).toBe('runs'))
  expect(runs).toBe(1)

  await router.invalidate()
  await waitFor(() => expect(runs).toBe(2))
  expect(router.state.matches.every((m: any) => m.status === 'success')).toBe(
    true,
  )
})

test('a notFound thrown from a loader keeps rendering notFoundComponent after invalidate', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw notFound()
    },
    component: () => <div data-testid="p">unreachable</div>,
    notFoundComponent: () => <div data-testid="p">missing</div>,
  })
  const router = mount(root.addChildren([index]), '/')

  await waitFor(() => expect(at('p')).toBe('missing'))
  await router.invalidate()
  await waitFor(() => expect(at('p')).toBe('missing'))
})

test('does not push to history when the url and state are unchanged', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]), '/')

  await waitFor(() => expect(at('p')).toBe('index'))
  const before = router.history.length
  await router.navigate({ to: '/' })
  expect(router.history.length).toBe(before)
})
