/**
 * Parity: `navigate` (part 3) — masking options, resetScroll, navigating from
 * loaders, params updaters, and the remaining relative-path matrix.
 */
import { expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useParams,
} from '@tanstack/svelte-router'

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

function deepTree(postComponent: any) {
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
  const postsIndex = createRoute({
    getParentRoute: () => posts,
    path: '/',
    component: () => <div data-testid="p">posts index</div>,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: postComponent,
  })
  return root.addChildren([index, posts.addChildren([postsIndex, post])])
}

// ---------------------------------------------------------------- masking

test('navigate with a mask shows the masked path', async () => {
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
  const secret = createRoute({
    getParentRoute: () => root,
    path: 'secret',
    component: () => <div data-testid="p">secret</div>,
  })
  const router = mount(root.addChildren([index, posts, secret]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/secret', mask: { to: '/posts' } as any })
  await waitFor(() => expect(at('p')).toBe('secret'))
  // The real route resolves; the mask is recorded separately.
  expect(router.state.location.pathname).toBe('/secret')
  expect((router.state.location as any).maskedLocation?.pathname).toBe('/posts')
})

test('resetScroll=false is accepted and still navigates', async () => {
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

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about', resetScroll: false })
  await waitFor(() => expect(at('p')).toBe('about'))
})

// --------------------------------------------------------------- params

test('a params updater function receives the previous params', async () => {
  const router = mount(
    deepTree(() => {
      const navigate = useNavigate()
      const p = useParams({ strict: false })
      return (
        <>
          <button
            onclick={() =>
              navigate({
                to: '/posts/$postId',
                params: ((prev: any) => ({
                  postId: `${prev.postId}-next`,
                })) as any,
              })
            }
          >
            bump
          </button>
          <div data-testid="p">{p.current.postId}</div>
        </>
      )
    }),
    '/posts/a',
  )

  await waitFor(() => expect(at('p')).toBe('a'))
  await click('bump')
  await waitFor(() => expect(at('p')).toBe('a-next'))
  expect(router.state.location.pathname).toBe('/posts/a-next')
})

test('navigating to the same route with new params re-renders', async () => {
  const router = mount(
    deepTree(() => {
      const p = useParams({ strict: false })
      return <div data-testid="p">{p.current.postId}</div>
    }),
    '/posts/1',
  )

  await waitFor(() => expect(at('p')).toBe('1'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: '2' } as any,
  })
  await waitFor(() => expect(at('p')).toBe('2'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: '3' } as any,
  })
  await waitFor(() => expect(at('p')).toBe('3'))
})

// -------------------------------------------------------- relative matrix

test('navigate from a child index to a sibling dynamic route', async () => {
  const router = mount(
    deepTree(() => <div data-testid="p">one post</div>),
    '/posts',
  )
  await waitFor(() => expect(at('p')).toBe('posts index'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: '4' } as any,
  })
  await waitFor(() => expect(at('p')).toBe('one post'))
})

test('navigate up from a dynamic route to the parent index', async () => {
  const router = mount(
    deepTree(() => <div data-testid="p">one post</div>),
    '/posts/4',
  )
  await waitFor(() => expect(at('p')).toBe('one post'))
  await router.navigate({ to: '/posts' })
  await waitFor(() => expect(at('p')).toBe('posts index'))
})

test('navigate from a deep route to the root index', async () => {
  const router = mount(
    deepTree(() => <div data-testid="p">one post</div>),
    '/posts/4',
  )
  await waitFor(() => expect(at('p')).toBe('one post'))
  await router.navigate({ to: '/' })
  await waitFor(() => expect(at('p')).toBe('index'))
})

// ------------------------------------------------------ navigate from hooks

test('navigating inside onMount lands on the target', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const navigate = useNavigate()

      queueMicrotask(() => navigate({ to: '/about' }))
      return <div data-testid="p">index</div>
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  mount(root.addChildren([index, about]))
  await waitFor(() => expect(at('p')).toBe('about'))
})

test('a navigate during a pending load settles on the later target', async () => {
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
      await new Promise((r) => setTimeout(r, 80))
      return 'slow'
    },
    component: () => <div data-testid="p">slow</div>,
  })
  const fast = createRoute({
    getParentRoute: () => root,
    path: 'fast',
    component: () => <div data-testid="p">fast</div>,
  })
  const router = mount(root.addChildren([index, slow, fast]))

  await waitFor(() => expect(at('p')).toBe('index'))
  router.navigate({ to: '/slow' })
  await router.navigate({ to: '/fast' })
  await waitFor(() => expect(at('p')).toBe('fast'))
  expect(router.state.location.pathname).toBe('/fast')
})

test('router.buildLocation produces the resolved href', async () => {
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

  const built = router.buildLocation({
    to: '/posts/$postId',
    params: { postId: '8' },
  } as any)
  expect(built.pathname).toBe('/posts/8')
})

test('navigate rejects nothing and resolves for an unchanged location', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await expect(router.navigate({ to: '/' })).resolves.not.toThrow()
})

test('a navigation spy sees each committed location', async () => {
  const seen: Array<string> = []
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
  router.subscribe('onResolved', () =>
    seen.push(router.state.location.pathname),
  )

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/a' })
  await waitFor(() => expect(at('p')).toBe('a'))
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('p')).toBe('b'))
  expect(seen).toEqual(expect.arrayContaining(['/a', '/b']))
})
