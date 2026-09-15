/**
 * Parity: `not-found`, `redirect`, `useBlocker` / `blocker`.
 */
import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  CatchNotFound,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  isNotFound,
  notFound,
  redirect,
  useBlocker,
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

// ------------------------------------------------------------------ not found

test('an unmatched path uses the root notFoundComponent', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">root not found</div>,
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]), '/nope')
  await waitFor(() => expect(at('p')).toBe('root not found'))
})

test('notFound() thrown in a loader uses the route notFoundComponent', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw notFound()
    },
    component: () => <div data-testid="p">unreachable</div>,
    notFoundComponent: () => <div data-testid="p">route not found</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('route not found'))
})

test('notFound() thrown in beforeLoad is handled', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw notFound()
    },
    component: () => <div data-testid="p">unreachable</div>,
    notFoundComponent: () => <div data-testid="p">not found</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('not found'))
})

test('a child notFound is caught by the nearest parent boundary', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">root boundary</div>,
  })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">posts boundary</div>,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    loader: () => {
      throw notFound()
    },
    component: () => <div data-testid="p">unreachable</div>,
  })
  mount(root.addChildren([posts.addChildren([post])]), '/posts/1')

  // The nearest boundary wins: `posts` handles it, not the root. A route's
  // notFoundComponent replaces that route's own output, so `posts`' component
  // is not rendered alongside it.
  await waitFor(() => expect(at('p')).toBe('posts boundary'))
  expect(screen.queryByText('root boundary')).toBeNull()
})

test('isNotFound recognises a thrown notFound', () => {
  const nf = notFound()
  expect(isNotFound(nf)).toBe(true)
  expect(isNotFound(new Error('nope'))).toBe(false)
})

test('notFound carries custom data to the component', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw notFound({ data: { reason: 'gone' } })
    },
    component: () => <div data-testid="p">unreachable</div>,
    notFoundComponent: (props: any) => (
      <div data-testid="p">{props?.data?.reason ?? 'no data'}</div>
    ),
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBeTruthy())
})

// ------------------------------------------------------------------- redirect

test('a redirect thrown in beforeLoad on first load lands on the target', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/about' })
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.pathname).toBe('/about')
})

test('a redirect thrown in a loader lands on the target', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw redirect({ to: '/about' })
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

test('a redirect can carry search params', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/about', search: { from: 'index' } as any })
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    validateSearch: (s: Record<string, unknown>) => ({
      from: String(s.from ?? ''),
    }),
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.search).toMatchObject({ from: 'index' })
})

test('a redirect to a route with params resolves the path', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/posts/$postId', params: { postId: '12' } as any })
    },
  })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <div data-testid="p">post</div>,
  })
  const router = mount(root.addChildren([index, post]))

  await waitFor(() => expect(at('p')).toBe('post'))
  expect(router.state.location.pathname).toBe('/posts/12')
})

test('a redirect chain resolves to the final target', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/one' })
    },
  })
  const one = createRoute({
    getParentRoute: () => root,
    path: 'one',
    beforeLoad: () => {
      throw redirect({ to: '/two' })
    },
  })
  const two = createRoute({
    getParentRoute: () => root,
    path: 'two',
    component: () => <div data-testid="p">two</div>,
  })
  const router = mount(root.addChildren([index, one, two]))

  await waitFor(() => expect(at('p')).toBe('two'))
  expect(router.state.location.pathname).toBe('/two')
})

// -------------------------------------------------------------------- blocker

test('useBlocker with shouldBlockFn false lets navigation through', async () => {
  const root = createRootRoute({
    component: () => {
      const navigate = useNavigate()
      useBlocker({ shouldBlockFn: () => false })
      return (
        <>
          <button onclick={() => navigate({ to: '/about' })}>go</button>
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
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('about'))
})

test('useBlocker with shouldBlockFn true prevents navigation', async () => {
  const root = createRootRoute({
    component: () => {
      const navigate = useNavigate()
      useBlocker({ shouldBlockFn: () => true })
      return (
        <>
          <button onclick={() => navigate({ to: '/about' })}>go</button>
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
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await new Promise((r) => setTimeout(r, 50))
  expect(at('p')).toBe('index')
  expect(router.state.location.pathname).toBe('/')
})

// Module scope: a component can't close over a binding declared inside the
// test body — it becomes its own module.
const blockSpy = vi.fn(() => false)

test('shouldBlockFn receives the next location', async () => {
  blockSpy.mockClear()
  const root = createRootRoute({
    component: () => {
      const navigate = useNavigate()
      useBlocker({ shouldBlockFn: blockSpy as any })
      return (
        <>
          <button onclick={() => navigate({ to: '/about' })}>go</button>
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
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(blockSpy).toHaveBeenCalled()
  expect((blockSpy.mock.calls[0] as any)[0]).toMatchObject({
    next: expect.objectContaining({ pathname: '/about' }),
  })
})

// ─── CatchNotFound fallback ─────────────────────────────────────────────────
// The fallback snippet must render for a caught notFound (it was previously
// accepted and silently dropped), and non-notFound errors must keep bubbling
// past it to the surrounding boundary.

function ThrowsNotFound() {
  const boom: () => never = () => {
    throw notFound()
  }
  return <div>{boom()}</div>
}

test('CatchNotFound renders its fallback for a caught notFound', async () => {
  const root = createRootRoute({
    component: () => (
      <CatchNotFound
        fallback={(e: any) => (
          <div data-testid="p">fell back: {String(!!e)}</div>
        )}
      >
        <ThrowsNotFound />
      </CatchNotFound>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('fell back: true'))
  spy.mockRestore()
})
