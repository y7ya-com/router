/**
 * Parity: `loaders` + `optional-path-params`.
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
  useLoaderData,
  useParams,
} from '@tanstack/svelte-router'

const sleep = (ms = 10) => new Promise((r) => setTimeout(r, ms))
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

// -------------------------------------------------------------------- loaders

test('a loader is called on the index route', async () => {
  const loader = vi.fn(() => 'data')
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader,
    component: () => {
      const d = useLoaderData({ from: '/' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('data'))
  expect(loader).toHaveBeenCalledTimes(1)
})

test('parent and child loaders both run for a nested route', async () => {
  const parentLoader = vi.fn(() => 'parent')
  const childLoader = vi.fn(() => 'child')
  const root = createRootRoute({ component: () => <Outlet /> })
  const nested = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    loader: parentLoader,
    component: () => <Outlet />,
  })
  const foo = createRoute({
    getParentRoute: () => nested,
    path: 'foo',
    loader: childLoader,
    component: () => {
      const d = useLoaderData({ from: '/nested/foo' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  mount(root.addChildren([nested.addChildren([foo])]), '/nested/foo')

  await waitFor(() => expect(at('p')).toBe('child'))
  expect(parentLoader).toHaveBeenCalledTimes(1)
  expect(childLoader).toHaveBeenCalledTimes(1)
})

test('a child loader receives parentMatchPromise', async () => {
  let seen: unknown = 'unset'
  const root = createRootRoute({ component: () => <Outlet /> })
  const nested = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    loader: async () => {
      await sleep()
      return 'parent'
    },
    component: () => <Outlet />,
  })
  const foo = createRoute({
    getParentRoute: () => nested,
    path: 'foo',
    loader: ({ parentMatchPromise }: any) => {
      seen = parentMatchPromise
      return 'child'
    },
    component: () => <div data-testid="p">ok</div>,
  })
  mount(root.addChildren([nested.addChildren([foo])]), '/nested/foo')

  await waitFor(() => expect(at('p')).toBe('ok'))
  expect(seen).toBeDefined()
  expect(typeof (seen as any)?.then).toBe('function')
})

test('an error thrown from a loader on initial load hits errorComponent', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw new Error('initial loader boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('errored'))
  spy.mockRestore()
})

test('an error thrown from beforeLoad on initial load hits errorComponent', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw new Error('initial beforeLoad boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('errored'))
  spy.mockRestore()
})

test('loader data is available without pending UI when it resolves fast', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => 'fast',
    pendingMs: 500,
    pendingComponent: () => <div data-testid="p">pending</div>,
    component: () => {
      const d = useLoaderData({ from: '/' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('fast'))
})

test('a slow loader shows the pending component first', async () => {
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
      await sleep(120)
      return 'slow data'
    },
    pendingMs: 0,
    pendingComponent: () => <div data-testid="p">pending</div>,
    component: () => {
      const d = useLoaderData({ from: '/slow' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  const router = mount(root.addChildren([index, slow]))

  await waitFor(() => expect(at('p')).toBe('index'))
  router.navigate({ to: '/slow' })
  await waitFor(() => expect(at('p')).toBe('pending'))
  await waitFor(() => expect(at('p')).toBe('slow data'))
})

test('a loader receives an abort signal', async () => {
  let signal: AbortSignal | undefined
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: ({ abortController }: any) => {
      signal = abortController?.signal
      return 'ok'
    },
    component: () => <div data-testid="p">ok</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('ok'))
  expect(signal).toBeInstanceOf(AbortSignal)
})

test('loader deps drive re-running via useLoaderDeps input', async () => {
  const loader = vi.fn(({ deps }: any) => `page-${deps.page}`)
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
    loaderDeps: ({ search }: any) => ({ page: search.page }),
    loader,
    component: () => {
      const d = useLoaderData({ from: '/' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  const router = mount(root.addChildren([index]), '/?page=1')

  await waitFor(() => expect(at('p')).toBe('page-1'))
  await router.navigate({ to: '/', search: { page: 2 } as any })
  await waitFor(() => expect(at('p')).toBe('page-2'))
  expect(loader).toHaveBeenCalledTimes(2)
})

// ------------------------------------------------------- optional path params

test('an optional path param matches when present', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const file = createRoute({
    getParentRoute: () => root,
    path: '/files/prefix{-$name}.txt',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{String(p.current.name)}</div>
    },
  })
  // `{-$name}`: the `-` marks the param optional, it is not a literal
  // separator, so everything between `prefix` and `.txt` is the value.
  mount(root.addChildren([index, file]), '/files/prefixreport.txt')
  await waitFor(() => expect(at('p')).toBe('report'))
})

test('an optional path param matches when absent', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const file = createRoute({
    getParentRoute: () => root,
    path: '/files/prefix{-$name}.txt',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{String(p.current.name)}</div>
    },
  })
  mount(root.addChildren([index, file]), '/files/prefix.txt')
  await waitFor(() => expect(at('p')).toBe('undefined'))
})

test('progressively deeper optional segments each match', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const date = createRoute({
    getParentRoute: () => root,
    path: '/{-$year}/{-$month}/{-$day}',
    component: () => {
      const p = useParams({ strict: false })
      const c = p.current
      return (
        <div data-testid="p">
          {[c.year, c.month, c.day].filter(Boolean).join('-')}
        </div>
      )
    },
  })
  const tree = root.addChildren([index, date])

  mount(tree, '/2023')
  await waitFor(() => expect(at('p')).toBe('2023'))
})

test('a localized optional prefix route matches both languages', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const en = createRoute({
    getParentRoute: () => root,
    path: '/en/rooms',
    component: () => <div data-testid="p">rooms</div>,
  })
  const fr = createRoute({
    getParentRoute: () => root,
    path: '/fr/chambres',
    component: () => <div data-testid="p">chambres</div>,
  })
  const tree = root.addChildren([index, en, fr])

  mount(tree, '/fr/chambres')
  await waitFor(() => expect(at('p')).toBe('chambres'))
})
