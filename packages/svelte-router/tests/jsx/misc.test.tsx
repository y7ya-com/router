/**
 * Parity: the small areas — RouterProvider, useParams, createLazyRoute,
 * disableGlobalCatchBoundary, Transitioner / remount, index matching,
 * component preload retry, same-route pending, store updates during navigation.
 */
import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createLazyRoute,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useParams,
  useRouterState,
} from '@tanstack/svelte-router'

const sleep = (ms = 10) => new Promise((r) => setTimeout(r, ms))
const at = (id: string) => screen.getByTestId(id).textContent
const click = async (t: string) => fireEvent.click(await screen.findByText(t))

function mount(routeTree: any, initial = '/', extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

// ------------------------------------------------------------ RouterProvider

test('RouterProvider renders the matched tree', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">provided</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('provided'))
})

test('a second router mounts independently of the first', async () => {
  const rootA = createRootRoute({ component: () => <Outlet /> })
  const indexA = createRoute({
    getParentRoute: () => rootA,
    path: '/',
    component: () => <div data-testid="a">router A</div>,
  })
  const rootB = createRootRoute({ component: () => <Outlet /> })
  const indexB = createRoute({
    getParentRoute: () => rootB,
    path: '/',
    component: () => <div data-testid="b">router B</div>,
  })

  render(RouterProvider, {
    props: {
      router: createRouter({
        routeTree: rootA.addChildren([indexA]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
      }),
    },
  })
  render(RouterProvider, {
    props: {
      router: createRouter({
        routeTree: rootB.addChildren([indexB]),
        history: createMemoryHistory({ initialEntries: ['/'] }),
      }),
    },
  })

  await waitFor(() => expect(at('a')).toBe('router A'))
  expect(at('b')).toBe('router B')
})

// ----------------------------------------------------------------- useParams

test('useParams with strict:false returns the merged params', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <Outlet />,
  })
  const tab = createRoute({
    getParentRoute: () => posts,
    path: '$tab',
    component: () => {
      const p = useParams({ strict: false })
      const c = p.current
      return (
        <div data-testid="p">
          {c.postId}/{c.tab}
        </div>
      )
    },
  })
  mount(root.addChildren([posts.addChildren([tab])]), '/posts/9/comments')
  await waitFor(() => expect(at('p')).toBe('9/comments'))
})

test('useParams updates when the param changes', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current.postId}</div>
    },
  })
  const router = mount(root.addChildren([post]), '/posts/1')

  await waitFor(() => expect(at('p')).toBe('1'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: '2' } as any,
  })
  await waitFor(() => expect(at('p')).toBe('2'))
})

// ------------------------------------------------------------ createLazyRoute

test('createLazyRoute supplies a component to a matching route', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' }).lazy(
    () =>
      Promise.resolve(
        createLazyRoute('/')({
          component: () => <div data-testid="p">lazy component</div>,
        }),
      ),
  )

  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('lazy component'))
})

test('a lazy route resolves before its content renders', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' }).lazy(
    async () => {
      await sleep(20)
      return createLazyRoute('/')({
        component: () => <div data-testid="p">arrived</div>,
      })
    },
  )

  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('arrived'))
})

test('the lazy options land on the route', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' }).lazy(
    () =>
      Promise.resolve(
        createLazyRoute('/')({
          component: () => <div data-testid="p">heavy</div>,
        }),
      ),
  )
  mount(root.addChildren([index]))

  // The lazily attached component is what renders.
  await waitFor(() => expect(at('p')).toBe('heavy'))
})

// ------------------------------------------------- global catch boundary

test('an error in a route component is caught by default', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      throw new Error('render boom')
    },
    errorComponent: () => <div data-testid="p">caught</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('caught'))
  spy.mockRestore()
})

test('disableGlobalCatchBoundary lets a route boundary handle it', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw new Error('loader boom')
    },
    errorComponent: () => <div data-testid="p">route boundary</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]), '/', { disableGlobalCatchBoundary: true })
  await waitFor(() => expect(at('p')).toBe('route boundary'))
  spy.mockRestore()
})

// --------------------------------------------------------------- transitions

test('the router reports isLoading while a slow route loads', async () => {
  const root = createRootRoute({
    component: () => {
      const s = useRouterState()
      return (
        <>
          <Link to="/slow">go</Link>
          <span data-testid="loading">
            {String((s.current as any).isLoading)}
          </span>
          <Outlet />
        </>
      )
    },
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const slow = createRoute({
    getParentRoute: () => root,
    path: 'slow',
    loader: async () => {
      await sleep(80)
      return 'ok'
    },
    component: () => <div data-testid="p">slow</div>,
  })
  mount(root.addChildren([index, slow]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(at('loading')).toBe('false')
  await click('go')
  await waitFor(() => expect(at('loading')).toBe('true'))
  await waitFor(() => expect(at('p')).toBe('slow'))
  await waitFor(() => expect(at('loading')).toBe('false'))
})

test('remounting the same route with different params re-runs its loader', async () => {
  const loader = vi.fn(({ params }: any) => `post-${params.postId}`)
  const root = createRootRoute({ component: () => <Outlet /> })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    loader,
    component: () => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current.postId}</div>
    },
  })
  const router = mount(root.addChildren([post]), '/posts/1')

  await waitFor(() => expect(at('p')).toBe('1'))
  expect(loader).toHaveBeenCalledTimes(1)
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: '2' } as any,
  })
  await waitFor(() => expect(at('p')).toBe('2'))
  expect(loader).toHaveBeenCalledTimes(2)
})

test('navigating to the same route does not blank the content', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/">self</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">stable</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('stable'))
  await router.navigate({ to: '/' })
  // no intermediate blank render
  expect(at('p')).toBe('stable')
})

test('the store keeps updating across a navigation', async () => {
  const seen: Array<string> = []
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
  const router = mount(root.addChildren([index, about]))
  router.subscribe('onResolved', () =>
    seen.push(router.state.location.pathname),
  )

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(seen).toContain('/about')
})

// -------------------------------------------------------------------- index

test('an index route matches only the exact parent path', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const postsIndex = createRoute({
    getParentRoute: () => posts,
    path: '/',
    component: () => <div data-testid="p">posts index</div>,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <div data-testid="p">one post</div>,
  })
  const tree = root.addChildren([posts.addChildren([postsIndex, post])])

  mount(tree, '/posts')
  await waitFor(() => expect(at('p')).toBe('posts index'))
})

test('a child path wins over the index route', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const postsIndex = createRoute({
    getParentRoute: () => posts,
    path: '/',
    component: () => <div data-testid="p">posts index</div>,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <div data-testid="p">one post</div>,
  })
  mount(root.addChildren([posts.addChildren([postsIndex, post])]), '/posts/1')
  await waitFor(() => expect(at('p')).toBe('one post'))
})

// -------------------------------------------------- component preload retry

test('preloading twice does not double-run the loader', async () => {
  const loader = vi.fn(() => 'x')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" preload="intent">
          posts
        </Link>
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
    loader,
  })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const link = screen.getByText('posts')
  await fireEvent.focus(link)
  await waitFor(() => expect(loader).toHaveBeenCalledTimes(1))
  await fireEvent.focus(link)
  await sleep(30)
  expect(loader).toHaveBeenCalledTimes(1)
})
