/**
 * Parity: `route` (part 2) — route identity (id/fullPath/to), the per-route
 * hook surface, and head assets (links / meta / scripts / styles) with and
 * without a loader.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  getRouteApi,
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

// ------------------------------------------------------------ route identity

test('fullPath, id and to are derived from the tree', () => {
  const root = createRootRoute()
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  const post = createRoute({ getParentRoute: () => posts, path: '$postId' })
  createRouter({ routeTree: root.addChildren([posts.addChildren([post])]) })

  expect((posts as any).fullPath).toBe('/posts')
  expect((post as any).fullPath).toBe('/posts/$postId')
  expect((post as any).id).toBe('/posts/$postId')
  expect((post as any).to).toBe('/posts/$postId')
})

test('an index child has the parent fullPath with a trailing slash id', () => {
  const root = createRootRoute()
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  const index = createRoute({ getParentRoute: () => posts, path: '/' })
  createRouter({ routeTree: root.addChildren([posts.addChildren([index])]) })

  expect((index as any).id).toBe('/posts/')
  expect((index as any).fullPath).toBe('/posts/')
})

test('the root route has the __root__ id', () => {
  const root = createRootRoute()
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  createRouter({ routeTree: root.addChildren([index]) })
  expect((root as any).id).toBe('__root__')
})

// --------------------------------------------------------- per-route hooks

test('a route exposes the full hook surface', () => {
  const root = createRootRoute()
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  createRouter({ routeTree: root.addChildren([index]) })

  for (const hook of [
    'useMatch',
    'useParams',
    'useSearch',
    'useLoaderData',
    'useLoaderDeps',
    'useRouteContext',
    'useNavigate',
  ]) {
    expect(typeof (index as any)[hook]).toBe('function')
  }
})

test('getRouteApi exposes the same hook surface', () => {
  const api = getRouteApi('/') as any
  for (const hook of [
    'useMatch',
    'useParams',
    'useSearch',
    'useLoaderData',
    'useLoaderDeps',
    'useRouteContext',
    'useNavigate',
  ]) {
    expect(typeof api[hook]).toBe('function')
  }
})

test('a route hook returns the rune wrapper shape', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => 'from loader',
    component: () => {
      const api = getRouteApi('/') as any
      const data = api.useLoaderData()
      return (
        <div data-testid="p">
          {String('current' in data)}:{data.current}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('true:from loader'))
})

test('router context is available inside RouterProvider', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const api = getRouteApi('/') as any
      const m = api.useMatch()
      return <div data-testid="p">{m.current.routeId}</div>
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('/'))
})

test('router.load resolves the matches without rendering', async () => {
  const root = createRootRoute()
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => 'loaded',
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  expect(router.state.matches.map((m: any) => m.routeId)).toEqual([
    '__root__',
    '/',
  ])
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.loaderData).toBe('loaded')
})

// ------------------------------------------------------------- head assets

test('a route head links entry renders, without a loader', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    head: () => ({ links: [{ rel: 'stylesheet', href: '/no-loader.css' }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head.querySelector('link[href="/no-loader.css"]'),
    ).not.toBeNull(),
  )
})

test('a route head links entry renders, with a loader', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => '/with-loader.css',
    head: ({ loaderData }: any) => ({
      links: [{ rel: 'stylesheet', href: loaderData }],
    }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head.querySelector('link[href="/with-loader.css"]'),
    ).not.toBeNull(),
  )
})

test('a route head meta renders, with a loader', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => 'meta-from-loader',
    head: ({ loaderData }: any) => ({
      meta: [{ name: 'loader-meta', content: loaderData }],
    }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head
        .querySelector('meta[name="loader-meta"]')
        ?.getAttribute('content'),
    ).toBe('meta-from-loader'),
  )
})

test('head receives params for a dynamic route', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    head: ({ params }: any) => ({ meta: [{ title: `Post ${params.postId}` }] }),
    component: () => <div data-testid="p">post</div>,
  })
  mount(root.addChildren([post]), '/posts/77')

  await waitFor(() => expect(at('p')).toBe('post'))
  await waitFor(() => expect(document.title).toBe('Post 77'))
})

test('head scripts are accepted without throwing', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    head: () => ({ scripts: [{ src: '/parity.js' }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('head styles are accepted without throwing', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => 'body { color: red }',
    head: ({ loaderData }: any) => ({ styles: [{ children: loaderData }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
})

// -------------------------------------------------------------- route options

test('a route staleTime option is accepted and the route still loads', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    staleTime: 1000,
    loader: () => 'fresh',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.loaderData).toBe('fresh')
})

test('shouldReload=false keeps the first loader result', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    shouldReload: false,
    loader: () => 'first',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/' })
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.loaderData).toBe('first')
})
