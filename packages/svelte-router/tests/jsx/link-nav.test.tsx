/**
 * Parity: `link` — navigation, relative paths, loader/beforeLoad interaction,
 * and route masking.
 */
import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouteMask,
  createRouter,
  redirect,
  useLoaderData,
  useParams,
  useRouteContext,
  useSearch,
} from '@tanstack/svelte-router'

function mount(opts: any, initial = '/') {
  const router = createRouter({
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...opts,
  })
  render(RouterProvider, { props: { router } })
  return router
}

const at = (id: string) => screen.getByTestId(id).textContent
// findByText waits for the initial render before clicking.
const click = async (t: string) => fireEvent.click(await screen.findByText(t))

// ------------------------------------------------------------- basic navigation

test('navigating to /posts', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
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
  mount({ routeTree: root.addChildren([index, posts]) })

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
})

test('navigating to /posts with search', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" search={{ page: 3 }}>
          go
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
    // Standalone hook with an explicit `from`, not `posts.useSearch()` — the
    // route is a test-local binding an extracted component can't close over.
    component: () => {
      const s = useSearch({ from: '/posts' })
      return <div data-testid="p">page {s.current.page}</div>
    },
  })
  const router = mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('page 3'))
  expect(router.state.location.search).toEqual({ page: 3 })
})

test('navigating with a basepath', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <div data-testid="p">posts</div>,
  })
  mount(
    { routeTree: root.addChildren([index, posts]), basepath: '/app' },
    '/app',
  )

  await waitFor(() =>
    expect(screen.getByText('go').getAttribute('href')).toBe('/app/posts'),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
})

// -------------------------------------------------------------- relative paths

test('navigating from /posts to ./$postId', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => (
      <>
        <Link from="/posts" to="./$postId" params={{ postId: '7' }}>
          go
        </Link>
        <Outlet />
      </>
    ),
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => {
      const p = useParams({ from: '/posts/$postId' })
      return <div data-testid="p">post {p.current.postId}</div>
    },
  })
  mount(
    { routeTree: root.addChildren([index, posts.addChildren([post])]) },
    '/posts',
  )

  await waitFor(() =>
    expect(screen.getByText('go').getAttribute('href')).toBe('/posts/7'),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('post 7'))
})

test('navigating from /posts/$postId back to /', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => (
      <>
        <Link to="/">up</Link>
        <div data-testid="p">post</div>
      </>
    ),
  })
  mount(
    { routeTree: root.addChildren([index, posts.addChildren([post])]) },
    '/posts/1',
  )

  await waitFor(() => expect(at('p')).toBe('post'))
  await click('up')
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('navigating from /posts to ../posts/$postId', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => (
      <>
        <Link from="/posts" to="../posts/$postId" params={{ postId: '9' }}>
          go
        </Link>
        <Outlet />
      </>
    ),
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <div data-testid="p">nine</div>,
  })
  mount(
    { routeTree: root.addChildren([index, posts.addChildren([post])]) },
    '/posts',
  )

  await waitFor(() =>
    expect(screen.getByText('go').getAttribute('href')).toBe('/posts/9'),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('nine'))
})

// ------------------------------------------------------ loaders and beforeLoad

test('navigating to a route with a loader', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    loader: () => 'loaded value',
    component: () => {
      const d = useLoaderData({ from: '/posts' })
      return <div data-testid="p">{d.current}</div>
    },
  })
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('loaded value'))
})

test('navigating to a route with a loader that errors', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    loader: () => {
      throw new Error('loader boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">loader errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('loader errored'))
  spy.mockRestore()
})

test('navigating away from a route whose loader errored recovers', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Link to="/">home</Link>
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
    loader: () => {
      throw new Error('loader boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">loader errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('loader errored'))
  await click('home')
  await waitFor(() => expect(at('p')).toBe('index'))
  spy.mockRestore()
})

test('beforeLoad that returns context', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    beforeLoad: () => ({ hello: 'from beforeLoad' }),
    component: () => {
      const ctx = useRouteContext({ from: '/posts' })
      return <div data-testid="p">{ctx.current.hello}</div>
    },
  })
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('from beforeLoad'))
})

test('beforeLoad that redirects', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const login = createRoute({
    getParentRoute: () => root,
    path: 'login',
    component: () => <div data-testid="p">login</div>,
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    beforeLoad: () => {
      throw redirect({ to: '/login' })
    },
    component: () => <div data-testid="p">unreachable</div>,
  })
  const router = mount({ routeTree: root.addChildren([index, login, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('login'))
  expect(router.state.location.pathname).toBe('/login')
})

test('beforeLoad that throws is caught by the nearest errorComponent', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    beforeLoad: () => {
      throw new Error('beforeLoad boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">beforeLoad errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('beforeLoad errored'))
  spy.mockRestore()
})

test('an error in a route component is caught by its errorComponent', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">go</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => {
      throw new Error('component boom')
    },
    errorComponent: () => <div data-testid="p">component errored</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount({ routeTree: root.addChildren([index, posts]) })

  await click('go')
  await waitFor(() => expect(at('p')).toBe('component errored'))
  spy.mockRestore()
})

// -------------------------------------------------------------------- masking

test('a declarative route mask rewrites the displayed location', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link to="/posts/$postId/info" params={{ postId: '5' }}>
        go
      </Link>
    ),
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <Outlet />,
  })
  const info = createRoute({
    getParentRoute: () => post,
    path: 'info',
    component: () => <div data-testid="p">info</div>,
  })

  const routeTree = root.addChildren([
    index,
    posts.addChildren([post.addChildren([info])]),
  ])
  const mask = createRouteMask({
    routeTree,
    from: '/posts/$postId/info',
    to: '/posts/$postId',
    params: true,
  })
  mount({ routeTree, routeMasks: [mask] })

  // The mask rewrites the rendered href; the real route still resolves.
  const link = await screen.findByText('go')
  expect(link.getAttribute('href')).toBe('/posts/5')

  await click('go')
  await waitFor(() => expect(at('p')).toBe('info'))
})
