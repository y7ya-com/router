/**
 * Parity: `useBlocker` / `useCanGoBack` tail, redirect options, and the
 * remaining `searchMiddleware` permutations.
 */
import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  retainSearchParams,
  stripSearchParams,
  useBlocker,
  useCanGoBack,
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

// Module scope: extracted components can't close over test-local bindings.
let blockNext = false
const blockFn = () => blockNext

function blockerTree() {
  const root = createRootRoute({
    component: () => {
      const navigate = useNavigate()
      const canGoBack = useCanGoBack()
      useBlocker({ shouldBlockFn: blockFn as any })
      return (
        <>
          <button onclick={() => navigate({ to: '/about' })}>go</button>
          <button onclick={() => navigate({ to: '/' })}>home</button>
          <span data-testid="back">{String(canGoBack.current)}</span>
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
  return root.addChildren([index, about])
}

// -------------------------------------------------------------------- blocker

test('a blocker can be toggled at runtime', async () => {
  blockNext = true
  const router = mount(blockerTree())

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await new Promise((r) => setTimeout(r, 40))
  expect(router.state.location.pathname).toBe('/')

  blockNext = false
  await click('go')
  await waitFor(() => expect(at('p')).toBe('about'))
})

test('useCanGoBack stays false before any navigation', async () => {
  blockNext = false
  mount(blockerTree())
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(at('back')).toBe('false')
})

test('useCanGoBack becomes true and history.back returns', async () => {
  blockNext = false
  const router = mount(blockerTree())

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(at('back')).toBe('true')

  router.history.back()
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('a blocker does not interfere with the initial load', async () => {
  blockNext = true
  mount(blockerTree(), '/about')
  await waitFor(() => expect(at('p')).toBe('about'))
})

// ------------------------------------------------------------------- redirect

test('a redirect with replace does not grow history', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <button onclick={() => navigate({ to: '/gated' })}>go</button>
          <div data-testid="p">index</div>
        </>
      )
    },
  })
  const gated = createRoute({
    getParentRoute: () => root,
    path: 'gated',
    beforeLoad: () => {
      throw redirect({ to: '/allowed', replace: true })
    },
  })
  const allowed = createRoute({
    getParentRoute: () => root,
    path: 'allowed',
    component: () => <div data-testid="p">allowed</div>,
  })
  const router = mount(root.addChildren([index, gated, allowed]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const before = router.history.length
  await click('go')
  await waitFor(() => expect(at('p')).toBe('allowed'))
  expect(router.history.length).toBeLessThanOrEqual(before + 1)
})

test('a redirect preserves an explicit hash', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/about', hash: 'target' })
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.hash).toBe('target')
})

test('a redirect from a nested route lands on the target', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    beforeLoad: () => {
      throw redirect({ to: '/login' })
    },
  })
  const login = createRoute({
    getParentRoute: () => root,
    path: 'login',
    component: () => <div data-testid="p">login</div>,
  })
  const router = mount(
    root.addChildren([posts.addChildren([post]), login]),
    '/posts/9',
  )

  await waitFor(() => expect(at('p')).toBe('login'))
  expect(router.state.location.pathname).toBe('/login')
})

test('a redirect target that itself 404s renders notFound', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    notFoundComponent: () => <div data-testid="p">not found</div>,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/nowhere' as any })
    },
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('not found'))
  spy.mockRestore()
})

// ----------------------------------------------------------- searchMiddleware

test('retainSearchParams keeps only the listed keys', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const validate = (s: Record<string, unknown>) => ({
    keep: String(s.keep ?? ''),
    drop: String(s.drop ?? ''),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: validate,
    search: { middlewares: [retainSearchParams(['keep'])] },
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    validateSearch: validate,
    search: { middlewares: [retainSearchParams(['keep'])] },
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]), '/?keep=yes&drop=no')

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.search).toMatchObject({ keep: 'yes' })
  expect(router.state.location.search.drop).toBe('')
})

test('stripSearchParams keeps a non-default value', async () => {
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
  const router = mount(root.addChildren([index]), '/?page=3')

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/', search: { page: 3 } as any })
  await waitFor(() =>
    expect(router.state.location.searchStr).toContain('page=3'),
  )
})

test('multiple middlewares compose', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const validate = (s: Record<string, unknown>) => ({
    keep: String(s.keep ?? ''),
    page: Number(s.page ?? 1),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    validateSearch: validate,
    search: {
      middlewares: [
        retainSearchParams(['keep']),
        stripSearchParams({ page: 1 }),
      ],
    },
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    validateSearch: validate,
    search: {
      middlewares: [
        retainSearchParams(['keep']),
        stripSearchParams({ page: 1 }),
      ],
    },
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]), '/?keep=yes&page=1')

  await waitFor(() => expect(at('p')).toBe('index'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  // retained, and the default page is stripped from the url
  expect(router.state.location.search).toMatchObject({ keep: 'yes' })
  expect(router.state.location.searchStr).not.toContain('page=1')
})
