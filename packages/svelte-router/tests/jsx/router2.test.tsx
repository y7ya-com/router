/**
 * Parity: `router` (part 2) — trailing slash, basepath matching, route options,
 * history modes, subscriptions, and error/pending state on matches.
 */
import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
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

function simpleTree() {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <div data-testid="p">posts</div>,
  })
  return root.addChildren([index, posts])
}

// ------------------------------------------------------------- trailing slash

test.each([
  ['never', '/posts'],
  ['always', '/posts/'],
  ['preserve', '/posts'],
])('trailingSlash=%s produces the href %s', async (mode, expected) => {
  const root = createRootRoute({
    component: () => (
      <>
        <LinkToPosts />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]), '/', { trailingSlash: mode as any })

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(screen.getByText('to-posts').getAttribute('href')).toBe(expected)
})

test('a path with a trailing slash still matches', async () => {
  mount(simpleTree(), '/posts/')
  await waitFor(() => expect(at('p')).toBe('posts'))
})

// -------------------------------------------------------------- basepath

test('a basepath is stripped when matching', async () => {
  const router = mount(simpleTree(), '/app/posts', { basepath: '/app' })
  await waitFor(() => expect(at('p')).toBe('posts'))
  // location.pathname is basepath-relative
  expect(router.state.location.pathname).toBe('/posts')
})

test('a basepath route resolves the index', async () => {
  mount(simpleTree(), '/app', { basepath: '/app' })
  await waitFor(() => expect(at('p')).toBe('index'))
})

// -------------------------------------------------------- match status/state

test('a match reports success once its loader resolves', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: async () => {
      await new Promise((r) => setTimeout(r, 20))
      return 'ok'
    },
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.status).toBe('success')
})

test('a match reports error when its loader throws', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw new Error('nope')
    },
    component: () => <div data-testid="p">index</div>,
    errorComponent: () => <div data-testid="p">errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('errored'))
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.status).toBe('error')
  spy.mockRestore()
})

test('router.state.location tracks the current entry', async () => {
  const router = mount(simpleTree(), '/')
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(router.state.location.pathname).toBe('/')
  await router.navigate({ to: '/posts' })
  await waitFor(() => expect(router.state.location.pathname).toBe('/posts'))
})

// ------------------------------------------------------------- subscriptions

test('unsubscribing stops further event delivery', async () => {
  const onResolved = vi.fn()
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
  const router = createRouter({
    routeTree: root.addChildren([index, about]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const unsub = router.subscribe('onResolved', onResolved)
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1))
  unsub()
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(onResolved).toHaveBeenCalledTimes(1)
})

test('onBeforeLoad fires for a navigation', async () => {
  const onBeforeLoad = vi.fn()
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
  const router = createRouter({
    routeTree: root.addChildren([index, about]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.subscribe('onBeforeLoad', onBeforeLoad)
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(onBeforeLoad).toHaveBeenCalled()
})

// ------------------------------------------------------------ route matching

test('a more specific static route beats a dynamic sibling', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const dynamic = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <div data-testid="p">dynamic</div>,
  })
  const staticRoute = createRoute({
    getParentRoute: () => root,
    path: 'posts/new',
    component: () => <div data-testid="p">static</div>,
  })
  mount(root.addChildren([index, dynamic, staticRoute]), '/posts/new')
  await waitFor(() => expect(at('p')).toBe('static'))
})

test('a splat route only matches when nothing more specific does', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const exact = createRoute({
    getParentRoute: () => root,
    path: 'files/readme',
    component: () => <div data-testid="p">exact</div>,
  })
  const splat = createRoute({
    getParentRoute: () => root,
    path: 'files/$',
    component: () => <div data-testid="p">splat</div>,
  })
  const tree = root.addChildren([index, exact, splat])

  mount(tree, '/files/readme')
  await waitFor(() => expect(at('p')).toBe('exact'))
})

test('an empty splat matches the bare prefix', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const splat = createRoute({
    getParentRoute: () => root,
    path: 'files/$',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">[{String(p.current._splat ?? '')}]</div>
    },
  })
  mount(root.addChildren([index, splat]), '/files')
  await waitFor(() => expect(at('p')).toBe('[]'))
})

test('caseSensitive route matching can be enabled', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">not found</div>,
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'Posts',
    caseSensitive: true,
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]), '/posts')
  await waitFor(() => expect(at('p')).toBe('not found'))
})

// Module scope: used as a component tag inside an extracted component.
function LinkToPosts() {
  return <Link to="/posts">to-posts</Link>
}
