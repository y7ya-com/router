/**
 * Parity: `link` — rendering, props, and active state.
 *
 * Mirrors the behaviours asserted by solid-router's link suite,
 * hand-written in TSX. Navigation and relative-path cases live in
 * link-nav.test.tsx.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'

function mount(routeTree: any, initial = '/') {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
  })
  render(RouterProvider, { props: { router } })
  return router
}

const anchor = (text: string) => screen.getByText(text)

// ---------------------------------------------------------------- rendering

test('a Link renders an anchor with an href', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">posts</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(anchor('posts').tagName).toBe('A'))
  expect(anchor('posts').getAttribute('href')).toBe('/posts')
})

test('a disabled Link has no href', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" disabled>
          posts
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(anchor('posts')).toBeTruthy())
  expect(anchor('posts').getAttribute('href')).toBeNull()
})

test('internal Link props are not forwarded to the DOM', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" activeOptions={{ exact: true }} preload={false}>
          posts
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(anchor('posts')).toBeTruthy())
  const el = anchor('posts')
  for (const attr of ['activeoptions', 'activeOptions', 'preload', 'to']) {
    expect(el.hasAttribute(attr)).toBe(false)
  }
})

test('a Link renders its children', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">
          <span data-testid="child">nested child</span>
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]))

  await waitFor(() =>
    expect(screen.getByTestId('child').textContent).toBe('nested child'),
  )
})

// ------------------------------------------------------------- active state

test('the link for the current route is active', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/">home</Link>
        <Link to="/posts">posts</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]), '/')

  await waitFor(() =>
    expect(anchor('home').getAttribute('data-status')).toBe('active'),
  )
  expect(anchor('home').getAttribute('aria-current')).toBe('page')
  expect(anchor('posts').getAttribute('data-status')).toBeNull()
})

test('an active link gets the default active class', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/">home</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]), '/')

  await waitFor(() => expect(anchor('home').className).toContain('active'))
})

test('activeProps and inactiveProps apply by state', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/"
          activeProps={{ class: 'is-on' }}
          inactiveProps={{ class: 'is-off' }}
        >
          home
        </Link>
        <Link
          to="/posts"
          activeProps={{ class: 'is-on' }}
          inactiveProps={{ class: 'is-off' }}
        >
          posts
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: '/posts' })
  mount(root.addChildren([index, posts]), '/')

  await waitFor(() => expect(anchor('home').className).toContain('is-on'))
  expect(anchor('posts').className).toContain('is-off')
})

test('fuzzy matching makes a parent link active, exact does not', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">fuzzy</Link>
        <Link to="/posts" activeOptions={{ exact: true }}>
          exact
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  const post = createRoute({ getParentRoute: () => posts, path: '$postId' })
  mount(root.addChildren([index, posts.addChildren([post])]), '/posts/1')

  await waitFor(() =>
    expect(anchor('fuzzy').getAttribute('data-status')).toBe('active'),
  )
  expect(anchor('exact').getAttribute('data-status')).toBeNull()
})

test('external links always report as inactive', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="https://example.com">external</Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]), '/')

  await waitFor(() =>
    expect(anchor('external').getAttribute('href')).toBe('https://example.com'),
  )
  expect(anchor('external').getAttribute('data-status')).toBeNull()
})

test('search-sensitive active state with includeSearch', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/posts"
          search={{ page: 1 }}
          activeOptions={{ includeSearch: true }}
        >
          page1
        </Link>
        <Link
          to="/posts"
          search={{ page: 2 }}
          activeOptions={{ includeSearch: true }}
        >
          page2
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
  })
  mount(root.addChildren([index, posts]), '/posts?page=2')

  await waitFor(() =>
    expect(anchor('page2').getAttribute('data-status')).toBe('active'),
  )
  expect(anchor('page1').getAttribute('data-status')).toBeNull()
})

test('hash-sensitive active state with includeHash', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" hash="a" activeOptions={{ includeHash: true }}>
          hashA
        </Link>
        <Link to="/posts" hash="b" activeOptions={{ includeHash: true }}>
          hashB
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  mount(root.addChildren([index, posts]), '/posts#b')

  await waitFor(() =>
    expect(anchor('hashB').getAttribute('data-status')).toBe('active'),
  )
  expect(anchor('hashA').getAttribute('data-status')).toBeNull()
})

test('a link with params builds the right href and active state', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts/$postId" params={{ postId: '1' }}>
          one
        </Link>
        <Link to="/posts/$postId" params={{ postId: '2' }}>
          two
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({ getParentRoute: () => root, path: 'posts' })
  const post = createRoute({ getParentRoute: () => posts, path: '$postId' })
  mount(root.addChildren([index, posts.addChildren([post])]), '/posts/2')

  await waitFor(() =>
    expect(anchor('one').getAttribute('href')).toBe('/posts/1'),
  )
  expect(anchor('two').getAttribute('href')).toBe('/posts/2')
  expect(anchor('two').getAttribute('data-status')).toBe('active')
  expect(anchor('one').getAttribute('data-status')).toBeNull()
})
