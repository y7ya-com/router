/**
 * Parity: `route`, `useMatch`, `Matches`, `searchMiddleware`, `ClientOnly`,
 * `createLazyRoute`.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  ClientOnly,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  retainSearchParams,
  stripSearchParams,
  useMatch,
  useMatches,
  useRouterState,
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

// --------------------------------------------------------------------- route

test('a route id is derived from its path', () => {
  const root = createRootRoute()
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  const post = createRoute({ getParentRoute: () => posts, path: '$postId' })
  // Ids are assigned when the router initialises the tree, not at createRoute.
  createRouter({ routeTree: root.addChildren([posts.addChildren([post])]) })

  expect((posts as any).id).toBe('/posts')
  expect((post as any).id).toBe('/posts/$postId')
})

test('a pathless layout route keeps its explicit id', () => {
  const root = createRootRoute()
  const layout = createRoute({ getParentRoute: () => root, id: '_layout' })
  const index = createRoute({ getParentRoute: () => layout, path: '/' })
  createRouter({ routeTree: root.addChildren([layout.addChildren([index])]) })

  expect((layout as any).id).toBe('/_layout')
  expect((index as any).id).toBe('/_layout/')
})

test('a route renders its component inside the parent Outlet', async () => {
  const root = createRootRoute({
    component: () => (
      <div data-testid="wrap">
        <Outlet />
      </div>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <span data-testid="p">child</span>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('child'))
  expect(screen.getByTestId('wrap').textContent).toContain('child')
})

test('a route with no component still matches', async () => {
  const root = createRootRoute({
    component: () => <div data-testid="p">root only</div>,
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const router = mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('root only'))
  expect(router.state.matches.map((m: any) => m.routeId)).toEqual([
    '__root__',
    '/',
  ])
})

// ------------------------------------------------------------------ useMatch

test('useMatch returns the match for a route', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const m = useMatch({ from: '/' })
      return <div data-testid="p">{(m.current as any).routeId}</div>
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('/'))
})

test('useMatch with strict:false returns undefined outside the route', async () => {
  const root = createRootRoute({
    component: () => {
      const m = useMatch({ from: '/about', shouldThrow: false })
      return (
        <>
          <div data-testid="p">{String(m.current === undefined)}</div>
          <Outlet />
        </>
      )
    },
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const about = createRoute({ getParentRoute: () => root, path: 'about' })
  mount(root.addChildren([index, about]))
  await waitFor(() => expect(at('p')).toBe('true'))
})

test('useMatch select narrows the value', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const status = useMatch({ from: '/', select: (m: any) => m.status })
      return <div data-testid="p">{status.current as any}</div>
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('success'))
})

// ------------------------------------------------------------------- Matches

test('useMatches lists the whole match chain', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => {
      const matches = useMatches()
      return (
        <div data-testid="p">
          {(matches.current as any).map((m: any) => m.routeId).join(',')}
        </div>
      )
    },
  })
  mount(root.addChildren([posts.addChildren([post])]), '/posts/1')
  await waitFor(() => expect(at('p')).toBe('__root__,/posts,/posts/$postId'))
})

test('useRouterState exposes the current location', async () => {
  const root = createRootRoute({
    component: () => {
      const state = useRouterState()
      return (
        <>
          <div data-testid="p">{(state.current as any).location.pathname}</div>
          <Outlet />
        </>
      )
    },
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const about = createRoute({ getParentRoute: () => root, path: 'about' })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('/'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('/about'))
})

// ------------------------------------------------------------ searchMiddleware

test('retainSearchParams keeps a param across navigation', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({
      keep: String(s.keep ?? ''),
    }),
    search: { middlewares: [retainSearchParams(['keep'])] },
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    validateSearch: (s: Record<string, unknown>) => ({
      keep: String(s.keep ?? ''),
    }),
    search: { middlewares: [retainSearchParams(['keep'])] },
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]), '/?keep=yes')

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.search).toMatchObject({ keep: 'yes' })
})

test('stripSearchParams removes a default value from the url', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
    search: { middlewares: [stripSearchParams({ page: 1 })] },
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]), '/?page=1')

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/', search: { page: 1 } as any })
  await waitFor(() =>
    expect(router.state.location.searchStr).not.toContain('page=1'),
  )
})

// ----------------------------------------------------------------- ClientOnly

test('ClientOnly renders its children on the client', async () => {
  const root = createRootRoute({
    component: () => (
      <ClientOnly>
        <span data-testid="p">client</span>
      </ClientOnly>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('client'))
})
