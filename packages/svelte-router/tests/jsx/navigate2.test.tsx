/**
 * Parity: `navigate` / `useNavigate` (part 2) — relative navigation, state,
 * hash, search updaters, and navigating from inside loaders/beforeLoad.
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
  useLocation,
  useNavigate,
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

// -------------------------------------------------------- relative navigation

test('navigate to ".." goes up one level', async () => {
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
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() => navigate({ from: '/posts/$postId', to: '..' })}
          >
            up
          </button>
          <div data-testid="p">one post</div>
        </>
      )
    },
  })
  const router = mount(
    root.addChildren([posts.addChildren([postsIndex, post])]),
    '/posts/1',
  )

  await waitFor(() => expect(at('p')).toBe('one post'))
  await click('up')
  await waitFor(() => expect(router.state.location.pathname).toBe('/posts'))
})

test('navigate to "." keeps the path and updates search', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() =>
              navigate({ from: '/posts', to: '.', search: { page: 4 } as any })
            }
          >
            bump
          </button>
          <div data-testid="p">posts</div>
        </>
      )
    },
  })
  const router = mount(root.addChildren([posts]), '/posts')

  await waitFor(() => expect(at('p')).toBe('posts'))
  await click('bump')
  await waitFor(() =>
    expect(router.state.location.search).toMatchObject({ page: 4 }),
  )
  expect(router.state.location.pathname).toBe('/posts')
})

// --------------------------------------------------------------- search + hash

test('a search updater function receives the previous search', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({
      count: Number(s.count ?? 0),
    }),
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() =>
              navigate({
                to: '/',
                search: ((p: any) => ({ count: p.count + 1 })) as any,
              })
            }
          >
            inc
          </button>
          <div data-testid="p">index</div>
        </>
      )
    },
  })
  const router = mount(root.addChildren([index]), '/?count=5')

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('inc')
  await waitFor(() =>
    expect(router.state.location.search).toMatchObject({ count: 6 }),
  )
})

test('navigate can set a hash', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button onclick={() => navigate({ to: '/', hash: 'section-2' })}>
            jump
          </button>
          <div data-testid="p">index</div>
        </>
      )
    },
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('jump')
  await waitFor(() => expect(router.state.location.hash).toBe('section-2'))
})

test('navigate can attach history state', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() =>
              navigate({ to: '/about', state: { from: 'index' } as any })
            }
          >
            go
          </button>
          <div data-testid="p">index</div>
        </>
      )
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('about'))
  expect((router.state.location.state as any).from).toBe('index')
})

test('useLocation reflects pathname, search and hash', async () => {
  const root = createRootRoute({
    component: () => {
      const loc = useLocation()
      const c = loc.current as any
      return (
        <>
          <div data-testid="p">
            {c.pathname}|{JSON.stringify(c.search)}|{c.hash}
          </div>
          <Outlet />
        </>
      )
    },
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: (s: Record<string, unknown>) => ({ a: String(s.a ?? '') }),
  })
  mount(root.addChildren([index]), '/?a=1#frag')
  await waitFor(() => expect(at('p')).toBe('/|{"a":"1"}|frag'))
})

// ------------------------------------------------ navigating from route hooks

test('useNavigate({ from }) supplies a default origin for relative paths', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const postsIndex = createRoute({
    getParentRoute: () => posts,
    path: '/',
    component: () => {
      // `from` is baked in, so the call site passes only a relative `to`.
      const navigate = useNavigate({ from: '/posts' })
      return (
        <>
          <button
            onclick={() =>
              navigate({ to: './$postId', params: { postId: '3' } as any })
            }
          >
            go
          </button>
          <div data-testid="p">posts index</div>
        </>
      )
    },
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <div data-testid="p">one post</div>,
  })
  const router = mount(
    root.addChildren([posts.addChildren([postsIndex, post])]),
    '/posts',
  )

  await waitFor(() => expect(at('p')).toBe('posts index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('one post'))
  expect(router.state.location.pathname).toBe('/posts/3')
})

test('two navigations in a row settle on the last one', async () => {
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
  router.navigate({ to: '/a' })
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('p')).toBe('b'))
  expect(router.state.location.pathname).toBe('/b')
})

test('navigate resolves after the target route has loaded', async () => {
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
      await new Promise((r) => setTimeout(r, 40))
      return 'x'
    },
    component: () => <div data-testid="p">slow</div>,
  })
  const router = mount(root.addChildren([index, slow]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/slow' })
  await waitFor(() => expect(router.state.location.pathname).toBe('/slow'))
})

test('navigate to a nonexistent path renders notFound', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">not found</div>,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/missing' as any })
  await waitFor(() => expect(at('p')).toBe('not found'))
})
