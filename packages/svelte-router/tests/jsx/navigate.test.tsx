/**
 * Parity: `navigate` + `useNavigate` + `useCanGoBack`.
 */
import { expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useCanGoBack,
  useNavigate,
  useRouter,
} from '@tanstack/svelte-router'

function mount(routeTree: any, initial = '/', extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

const at = (id: string) => screen.getByTestId(id).textContent
const click = async (t: string) => fireEvent.click(await screen.findByText(t))

const tree = (rootComponent: any) => {
  const root = createRootRoute({ component: rootComponent })
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
  const post = createRoute({
    getParentRoute: () => root,
    path: 'items/$itemId',
    component: () => <div data-testid="p">item</div>,
  })
  return root.addChildren([index, posts, post])
}

test('useNavigate navigates to a path', async () => {
  mount(
    tree(() => {
      const navigate = useNavigate()
      return (
        <>
          <button onclick={() => navigate({ to: '/posts' })}>go</button>
          <Outlet />
        </>
      )
    }),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
})

test('useNavigate with params', async () => {
  mount(
    tree(() => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() =>
              navigate({ to: '/items/$itemId', params: { itemId: '3' } })
            }
          >
            go
          </button>
          <Outlet />
        </>
      )
    }),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('item'))
})

test('useNavigate with search', async () => {
  const router = mount(
    tree(() => {
      const navigate = useNavigate()
      return (
        <>
          <button
            onclick={() =>
              navigate({ to: '/posts', search: { q: 'x' } as any })
            }
          >
            go
          </button>
          <Outlet />
        </>
      )
    }),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(router.state.location.searchStr).toContain('q=x')
})

test('navigate with replace does not grow history', async () => {
  const router = mount(
    tree(() => {
      const navigate = useNavigate()
      return (
        <>
          <button onclick={() => navigate({ to: '/posts', replace: true })}>
            go
          </button>
          <Outlet />
        </>
      )
    }),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  const before = router.history.length
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(router.history.length).toBe(before)
})

// `Navigate` must be a real .svelte component (src/Navigate.svelte): Svelte 5
// invokes components as (anchor, props), so a plain function exported as a
// component receives the anchor where it expects props and navigates nowhere.
test('the Navigate component redirects on mount', async () => {
  mount(
    tree(() => (
      <>
        <Navigate to="/posts" />
        <Outlet />
      </>
    )),
  )
  await waitFor(() => expect(at('p')).toBe('posts'))
})

test('router.navigate navigates imperatively', async () => {
  const router = mount(tree(() => <Outlet />))
  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/posts' })
  await waitFor(() => expect(at('p')).toBe('posts'))
})

test('useCanGoBack is false at the start and true after navigating', async () => {
  mount(
    tree(() => {
      const navigate = useNavigate()
      const canGoBack = useCanGoBack()
      return (
        <>
          <button onclick={() => navigate({ to: '/posts' })}>go</button>
          <span data-testid="back">{String(canGoBack.current)}</span>
          <Outlet />
        </>
      )
    }),
  )
  await waitFor(() => expect(at('back')).toBe('false'))
  await click('go')
  await waitFor(() => expect(at('back')).toBe('true'))
})

test('history.back returns to the previous route', async () => {
  const router = mount(
    tree(() => {
      const navigate = useNavigate()
      return (
        <>
          <button onclick={() => navigate({ to: '/posts' })}>go</button>
          <Outlet />
        </>
      )
    }),
  )
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
  router.history.back()
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('useRouter exposes the router instance', async () => {
  mount(
    tree(() => {
      const router = useRouter()
      return (
        <>
          <span data-testid="path">{router.state.location.pathname}</span>
          <Outlet />
        </>
      )
    }),
  )
  await waitFor(() => expect(at('path')).toBe('/'))
})
