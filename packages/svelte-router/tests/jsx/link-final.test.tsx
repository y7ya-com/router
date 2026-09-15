/**
 * Parity: `link` (part 5, final) — preload timing, reactive option changes,
 * createLink variants, and the remaining relative-path permutations.
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

// Module scope: reachable from extracted component modules.
const CustomLink = createLink(Link as any) as any

// --------------------------------------------------------------- preloading

test('defaultPreload=intent at the router level preloads on hover', async () => {
  const loader = vi.fn(() => 'x')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts">posts-link</Link>
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
  mount(root.addChildren([index, posts]), '/', { defaultPreload: 'intent' })

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.mouseEnter(anchor('posts-link'))
  await waitFor(() => expect(loader).toHaveBeenCalled())
})

test('a per-link preload=false overrides the router default', async () => {
  const loader = vi.fn(() => 'x')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" preload={false}>
          posts-link
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
  mount(root.addChildren([index, posts]), '/', { defaultPreload: 'intent' })

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.mouseEnter(anchor('posts-link'))
  await new Promise((r) => setTimeout(r, 60))
  expect(loader).not.toHaveBeenCalled()
})

test('preloaded data is reused on the subsequent navigation', async () => {
  const loader = vi.fn(() => 'preloaded value')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" preload="intent">
          posts-link
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
    // Without a stale time the preloaded data is immediately stale and the
    // loader runs again on navigation.
    staleTime: 5000,
    loader,
    component: () => <div data-testid="p">posts</div>,
  })
  mount(root.addChildren([index, posts]), '/', {
    defaultPreloadStaleTime: 5000,
  })

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.mouseEnter(anchor('posts-link'))
  await waitFor(() => expect(loader).toHaveBeenCalledTimes(1))
  await click('posts-link')
  await waitFor(() => expect(at('p')).toBe('posts'))
  // the preload primed the cache; no second run
  expect(loader).toHaveBeenCalledTimes(1)
})

test('touchstart also triggers an intent preload', async () => {
  const loader = vi.fn(() => 'x')
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/posts" preload="intent">
          posts-link
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
  await fireEvent.touchStart(anchor('posts-link'))
  await waitFor(() => expect(loader).toHaveBeenCalled())
})

// ------------------------------------------------------------- createLink

test('createLink forwards extra props to the underlying anchor', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <CustomLink to="/posts" id="custom-id" title="custom title">
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
  expect(anchor('custom').getAttribute('id')).toBe('custom-id')
  expect(anchor('custom').getAttribute('title')).toBe('custom title')
})

test('createLink preserves active state handling', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <CustomLink to="/" activeOptions={{ exact: true }}>
          home
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
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(anchor('home').getAttribute('data-status')).toBe('active')
})

// ------------------------------------------------- relative-path remainder

test('a link from an index route to a sibling section', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const shop = createRoute({
    getParentRoute: () => root,
    path: 'shop',
    component: () => <Outlet />,
  })
  const shopIndex = createRoute({
    getParentRoute: () => shop,
    path: '/',
    component: () => (
      <>
        <Link from="/shop" to="./cart">
          cart
        </Link>
        <div data-testid="p">shop index</div>
      </>
    ),
  })
  const cart = createRoute({
    getParentRoute: () => shop,
    path: 'cart',
    component: () => <div data-testid="p">cart</div>,
  })
  mount(root.addChildren([shop.addChildren([shopIndex, cart])]), '/shop')

  await waitFor(() => expect(at('p')).toBe('shop index'))
  expect(href('cart')).toBe('/shop/cart')
  await click('cart')
  await waitFor(() => expect(at('p')).toBe('cart'))
})

test('a link with ../.. climbs two levels', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const top = createRoute({
    getParentRoute: () => root,
    path: 'top',
    component: () => <Outlet />,
  })
  const topIndex = createRoute({
    getParentRoute: () => top,
    path: '/',
    component: () => <div data-testid="p">top index</div>,
  })
  const mid = createRoute({
    getParentRoute: () => top,
    path: 'mid',
    component: () => <Outlet />,
  })
  const leaf = createRoute({
    getParentRoute: () => mid,
    path: 'leaf',
    component: () => (
      <>
        <Link from="/top/mid/leaf" to="../..">
          up2
        </Link>
        <div data-testid="p">leaf</div>
      </>
    ),
  })
  mount(
    root.addChildren([top.addChildren([topIndex, mid.addChildren([leaf])])]),
    '/top/mid/leaf',
  )

  await waitFor(() => expect(at('p')).toBe('leaf'))
  expect(href('up2')).toBe('/top')
  await click('up2')
  await waitFor(() => expect(at('p')).toBe('top index'))
})

test('a link keeps search when navigating within the same route', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const posts = createRoute({
    getParentRoute: () => root,
    path: 'posts',
    validateSearch: (s: Record<string, unknown>) => ({
      page: Number(s.page ?? 1),
      q: String(s.q ?? ''),
    }),
    component: () => (
      <>
        <Link
          from="/posts"
          to="."
          search={((p: any) => ({ ...p, page: p.page + 1 })) as any}
        >
          next
        </Link>
        <div data-testid="p">posts</div>
      </>
    ),
  })
  const router = mount(root.addChildren([posts]), '/posts?page=1&q=abc')

  await waitFor(() => expect(at('p')).toBe('posts'))
  await click('next')
  await waitFor(() =>
    expect(router.state.location.search).toMatchObject({ page: 2, q: 'abc' }),
  )
})

test('a link to a splat route builds the splat segment', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Link to="/files/$" params={{ _splat: 'a/b/c' } as any}>
          deep
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
  const files = createRoute({
    getParentRoute: () => root,
    path: 'files/$',
    component: () => <div data-testid="p">files</div>,
  })
  mount(root.addChildren([index, files]))

  await waitFor(() => expect(at('p')).toBe('index'))
  expect(href('deep')).toBe('/files/a/b/c')
  await click('deep')
  await waitFor(() => expect(at('p')).toBe('files'))
})

test('an href updates when the route tree resolves a different param', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => (
      <>
        <Link from="/posts/$postId" to=".">
          self
        </Link>
        <div data-testid="p">post</div>
      </>
    ),
  })
  const router = mount(root.addChildren([index, post]), '/posts/first')

  await waitFor(() => expect(href('self')).toBe('/posts/first'))
  await router.navigate({
    to: '/posts/$postId',
    params: { postId: 'second' } as any,
  })
  await waitFor(() => expect(href('self')).toBe('/posts/second'))
})
