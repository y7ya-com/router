/**
 * Parity: `link` — reactivity, preload, createLink, and the remaining
 * relative-path permutations.
 */
import { expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createLink,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from '@tanstack/svelte-router'

const at = (id: string) => screen.getByTestId(id).textContent
const href = (t: string) => screen.getByText(t).getAttribute('href')
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

// -------------------------------------------------------------- reactive href

test('a relative href updates when the current route changes', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to=".">self</Link>
        <Outlet />
      </>
    ),
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

  await waitFor(() => expect(href('self')).toBe('/'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(href('self')).toBe('/about')
})

test('active state updates as the route changes', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/" activeOptions={{ exact: true }}>
          home
        </Link>
        <Link to="/about">about</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index page</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    // distinct from the link text, so getByText stays unambiguous
    component: () => <div data-testid="p">about page</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() =>
    expect(screen.getByText('home').getAttribute('data-status')).toBe('active'),
  )
  await router.navigate({ to: '/about' })
  await waitFor(() =>
    expect(screen.getByText('about').getAttribute('data-status')).toBe(
      'active',
    ),
  )
  expect(screen.getByText('home').getAttribute('data-status')).toBeNull()
})

test('href updates when only params change', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => (
      <>
        <Link to="/posts/$postId" params={{ postId: 'next' }}>
          jump
        </Link>
        <div data-testid="p">post</div>
      </>
    ),
  })
  const router = mount(root.addChildren([index, post]), '/posts/a')

  await waitFor(() => expect(href('jump')).toBe('/posts/next'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: 'b' } as any,
  })
  await waitFor(() => expect(router.state.location.pathname).toBe('/posts/b'))
  expect(href('jump')).toBe('/posts/next')
})

test('activeOptions.explicitUndefined treats undefined as a required match', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/posts"
          search={{ page: undefined } as any}
          activeOptions={{ includeSearch: true, explicitUndefined: true }}
        >
          strict-link
        </Link>
        <Link
          to="/posts"
          search={{ page: undefined } as any}
          activeOptions={{ includeSearch: true }}
        >
          loose-link
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
      page: s.page as number | undefined,
    }),
    component: () => <div data-testid="p">posts page</div>,
  })
  mount(root.addChildren([index, posts]), '/posts?page=2')

  await waitFor(() => expect(at('p')).toBe('posts page'))
  const status = (t: string) => screen.getByText(t).getAttribute('data-status')

  // explicitUndefined: `page: undefined` must genuinely match, and page is 2.
  expect(status('strict-link')).toBeNull()
  // without it, an undefined value is simply ignored when comparing.
  expect(status('loose-link')).toBe('active')
})

// ------------------------------------------------------------ relative paths

test('navigating to "." from /posts while updating search', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
    component: () => (
      <>
        <Link from="/posts" to="." search={{ page: 5 } as any}>
          page5
        </Link>
        <div data-testid="p">posts</div>
      </>
    ),
  })
  const router = mount(root.addChildren([index, posts]), '/posts')

  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(href('page5')).toBe('/posts?page=5')
  await click('page5')
  await waitFor(() =>
    expect(router.state.location.search).toMatchObject({ page: 5 }),
  )
})

test('navigating from a deep route to ./info', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <Outlet />,
  })
  const details = createRoute({
    getParentRoute: () => post,
    path: 'details',
    component: () => (
      <>
        <Link from="/posts/$postId/details" to="../info">
          info
        </Link>
        <div data-testid="p">details</div>
      </>
    ),
  })
  const info = createRoute({
    getParentRoute: () => post,
    path: 'info',
    component: () => <div data-testid="p">info</div>,
  })
  mount(
    root.addChildren([index, post.addChildren([details, info])]),
    '/posts/7/details',
  )

  await waitFor(() => expect(at('p')).toBe('details'))
  expect(href('info')).toBe('/posts/7/info')
  await click('info')
  await waitFor(() => expect(at('p')).toBe('info'))
})

test('navigating from a deep route to "/" resets to the root', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <Outlet />,
  })
  const details = createRoute({
    getParentRoute: () => post,
    path: 'details',
    component: () => (
      <>
        <Link to="/">root</Link>
        <div data-testid="p">details</div>
      </>
    ),
  })
  mount(
    root.addChildren([index, post.addChildren([details])]),
    '/posts/7/details',
  )

  await waitFor(() => expect(at('p')).toBe('details'))
  expect(href('root')).toBe('/')
  await click('root')
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('a relative link keeps inherited params', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => <Outlet />,
  })
  const details = createRoute({
    getParentRoute: () => post,
    path: 'details',
    component: () => (
      <>
        <Link from="/posts/$postId/details" to="../info">
          info
        </Link>
        <div data-testid="p">details</div>
      </>
    ),
  })
  const info = createRoute({ getParentRoute: () => post, path: 'info' })
  const router = mount(
    root.addChildren([index, post.addChildren([details, info])]),
    '/posts/aaa/details',
  )

  await waitFor(() => expect(href('info')).toBe('/posts/aaa/info'))
  await router.navigate({
    to: '/posts/$postId/details',
    params: { postId: 'bbb' } as any,
  })
  await waitFor(() => expect(href('info')).toBe('/posts/bbb/info'))
})

test('a nested dashboard route resolves a sibling section', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const dash = createRoute({
    getParentRoute: () => root,
    path: 'dashboard',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => dash,
    path: 'posts/$postId',
    component: () => (
      <>
        <Link to="/dashboard/users">users</Link>
        <div data-testid="p">post</div>
      </>
    ),
  })
  const users = createRoute({
    getParentRoute: () => dash,
    path: 'users',
    component: () => <div data-testid="p">users</div>,
  })
  mount(
    root.addChildren([index, dash.addChildren([post, users])]),
    '/dashboard/posts/1',
  )

  await waitFor(() => expect(at('p')).toBe('post'))
  expect(href('users')).toBe('/dashboard/users')
  await click('users')
  await waitFor(() => expect(at('p')).toBe('users'))
})

// ------------------------------------------------------------------- preload

test('preload=intent preloads the target on hover', async () => {
  const loader = vi.fn(() => 'preloaded')
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
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(loader).not.toHaveBeenCalled()

  await fireEvent.focus(screen.getByText('posts'))
  await waitFor(() => expect(loader).toHaveBeenCalled())
})

test('preload=false does not preload', async () => {
  const loader = vi.fn(() => 'x')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" preload={false}>
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
  await fireEvent.focus(screen.getByText('posts'))
  await new Promise((r) => setTimeout(r, 50))
  expect(loader).not.toHaveBeenCalled()
})

test('preloading a route whose beforeLoad redirects does not crash', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/private" preload="intent">
          private
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
  const login = createRoute({ getParentRoute: () => root, path: 'login' })
  const priv = createRoute({
    getParentRoute: () => root,
    path: 'private',
    beforeLoad: () => {
      throw redirect({ to: '/login' })
    },
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index, login, priv]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.focus(screen.getByText('private'))
  await new Promise((r) => setTimeout(r, 60))
  // still on the index route; preloading must not navigate
  expect(at('p')).toBe('index')
  spy.mockRestore()
})

test('preloading a route whose loader redirects does not crash', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/private" preload="intent">
          private
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
  const login = createRoute({ getParentRoute: () => root, path: 'login' })
  const priv = createRoute({
    getParentRoute: () => root,
    path: 'private',
    loader: () => {
      throw redirect({ to: '/login' })
    },
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index, login, priv]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.focus(screen.getByText('private'))
  await new Promise((r) => setTimeout(r, 60))
  expect(at('p')).toBe('index')
  spy.mockRestore()
})

// ---------------------------------------------------------------- createLink

// Module scope: a component tag used inside an extracted component must be
// reachable from that module.
//
// `as any` because component *tags* aren't prop-checked yet — a Svelte
// component's props live in its second parameter and TS's JSX rules read the
// first. See src/jsx.d.ts. Intrinsic elements are fully checked.
const CustomLink = createLink(Link as any) as any

test('createLink wraps a custom anchor component', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <CustomLink to="/posts" data-testid="custom">
          custom
        </CustomLink>
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
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(href('custom')).toBe('/posts')
  await click('custom')
  await waitFor(() => expect(at('p')).toBe('posts'))
})

// ------------------------------------------------------- root beforeLoad error

test('a root beforeLoad that throws renders the root errorComponent', async () => {
  const root = createRootRoute({
    beforeLoad: () => {
      throw new Error('root boom')
    },
    component: () => <Outlet />,
    errorComponent: () => <div data-testid="p">root errored</div>,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('root errored'))
  spy.mockRestore()
})

test('a link to a route with invalid search still renders', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" search={{ page: 'not-a-number' } as any}>
          bad
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
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
    }),
  })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(href('bad')).toContain('/posts')
})

test('useNavigate from a link click target reaches the same route', async () => {
  const root = createRootRoute({
    component: () => {
      const navigate = useNavigate()
      return (
        <>
          <Link to="/posts">via-link</Link>
          <button onclick={() => navigate({ to: '/posts' })}>via-hook</button>
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
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <div data-testid="p">posts</div>,
  })
  const router = mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('via-hook')
  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(router.state.location.pathname).toBe('/posts')
})
