/**
 * Parity: `link` (part 4) — imperative masking, trailing slashes, target /
 * modifier handling, disabled behaviour, and the remaining active-state matrix.
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
  createRouter,
} from '@tanstack/svelte-router'

const at = (id: string) => screen.getByTestId(id).textContent
const anchor = (t: string) => screen.getByText(t)
const href = (t: string) => anchor(t).getAttribute('href')
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

function postsTree(rootComponent: any) {
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

// ---------------------------------------------------------- imperative mask

test('an imperative mask rewrites the href via mask options', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/items/$itemId"
          params={{ itemId: '5' }}
          mask={{ to: '/posts' }}
        >
          masked
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
    component: () => <div data-testid="p">posts</div>,
  })
  const item = createRoute({
    getParentRoute: () => root,
    path: 'items/$itemId',
    component: () => <div data-testid="p">item</div>,
  })
  mount(root.addChildren([index, posts, item]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(href('masked')).toBe('/posts')
  await click('masked')
  // the real route still resolves behind the mask
  await waitFor(() => expect(at('p')).toBe('item'))
})

// ------------------------------------------------------------ target / keys

test('a Link with target=_blank still renders an href', async () => {
  mount(
    postsTree(() => (
      <>
        <Link to="/posts" target="_blank">
          ext
        </Link>
        <Outlet />
      </>
    )),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(anchor('ext').getAttribute('target')).toBe('_blank')
  expect(href('ext')).toBe('/posts')
})

test('a metaKey click does not trigger client navigation', async () => {
  const router = mount(
    postsTree(() => (
      <>
        <Link to="/posts">posts-link</Link>
        <Outlet />
      </>
    )),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.click(anchor('posts-link'), { metaKey: true })
  await new Promise((r) => setTimeout(r, 40))
  expect(router.state.location.pathname).toBe('/')
})

test('a disabled Link does not navigate on click', async () => {
  const router = mount(
    postsTree(() => (
      <>
        <Link to="/posts" disabled>
          posts-link
        </Link>
        <Outlet />
      </>
    )),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  await click('posts-link')
  await new Promise((r) => setTimeout(r, 40))
  expect(router.state.location.pathname).toBe('/')
  expect(at('p')).toBe('index')
})

// --------------------------------------------------------------- attributes

test('arbitrary anchor attributes pass through to the DOM', async () => {
  mount(
    postsTree(() => (
      <>
        <Link to="/posts" id="my-link" title="a title" rel="noreferrer">
          attrs
        </Link>
        <Outlet />
      </>
    )),
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  const el = anchor('attrs')
  expect(el.getAttribute('id')).toBe('my-link')
  expect(el.getAttribute('title')).toBe('a title')
  expect(el.getAttribute('rel')).toBe('noreferrer')
})

// Module scope: an extracted component can't close over a test-local binding.
const clickSpy = vi.fn()

// Link.svelte spreads the rest props BEFORE its own handlers and composes
// each one with the user's: the user's handler runs first and a
// `preventDefault()` there suppresses navigation (mirroring React's
// composeHandlers). In Svelte a later spread wins, so the other order would
// let a user `onclick` replace the navigation handler outright.
test('a Link onclick handler runs alongside navigation', async () => {
  clickSpy.mockClear()
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" onclick={() => clickSpy()}>
          go
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
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await click('go')
  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(clickSpy).toHaveBeenCalled()
})

// --------------------------------------------------------- trailing slashes

test('a link href respects trailingSlash=always', async () => {
  mount(
    postsTree(() => (
      <>
        <Link to="/posts">slashy</Link>
        <Outlet />
      </>
    )),
    '/',
    { trailingSlash: 'always' },
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(href('slashy')).toBe('/posts/')
})

test('a link to a trailing-slash path still navigates', async () => {
  const router = mount(
    postsTree(() => (
      <>
        <Link to="/posts">slashy</Link>
        <Outlet />
      </>
    )),
    '/',
    { trailingSlash: 'always' },
  )
  await waitFor(() => expect(at('p')).toBe('index'))
  await click('slashy')
  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(router.state.location.pathname).toBe('/posts/')
})

// ------------------------------------------------------- active-state matrix

test('an exact link is inactive on a deeper path', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" activeOptions={{ exact: true }}>
          exact
        </Link>
        <Outlet />
      </>
    ),
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    component: () => <Outlet />,
  })
  const post = createRoute({
    getParentRoute: () => posts,
    path: '$postId',
    component: () => <div data-testid="p">post</div>,
  })
  mount(root.addChildren([index, posts.addChildren([post])]), '/posts/1')

  await waitFor(() => expect(at('p')).toBe('post'))
  expect(anchor('exact').getAttribute('data-status')).toBeNull()
})

test('activeProps given as a function is evaluated', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/"
          activeOptions={{ exact: true }}
          activeProps={() => ({ class: 'fn-active' })}
        >
          home
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
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(anchor('home').className).toContain('fn-active')
})

test('a search-only difference makes an includeSearch link inactive', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link
          to="/posts"
          search={{ page: 1 } as any}
          activeOptions={{ includeSearch: true }}
        >
          page1
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
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]), '/posts?page=9')

  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(anchor('page1').getAttribute('data-status')).toBeNull()
})

test('search is compared by default, so a differing query is inactive', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" search={{ page: 1 } as any}>
          anypage
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
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]), '/posts?page=9')

  await waitFor(() => expect(at('p')).toBe('posts'))
  // activeOptions.includeSearch defaults to true (Link.svelte: `?? true`).
  expect(anchor('anypage').getAttribute('data-status')).toBeNull()
})

test('a hash-only difference is ignored unless includeHash is set', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" hash="a">
          hashA
        </Link>
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
  mount(root.addChildren([index, posts]), '/posts#zzz')

  await waitFor(() => expect(at('p')).toBe('posts'))
  expect(anchor('hashA').getAttribute('data-status')).toBe('active')
})
