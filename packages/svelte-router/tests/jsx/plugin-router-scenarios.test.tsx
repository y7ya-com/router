/**
 * Five real router scenarios, hand-written in TSX.
 *
 * The readiness gate: a construct census says "I recognise this shape", these
 * say "it actually behaves". Everything here is written the way the other ports
 * write it — inline `component:` closures, fragments, `<Link>`, `<Outlet/>`.
 */
import { expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
} from '@tanstack/svelte-router'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav>
        <Link to="/">home</Link>
        <Link to="/posts">posts</Link>
        <Link to="/search">search</Link>
      </nav>
      <Outlet />
    </>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <h1 data-testid="page">Index</h1>,
})

// 1. Loader data, and a `.map` over it -> {#each}.
const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  loader: () => ['alpha', 'beta', 'gamma'],
  component: () => {
    const posts = postsRoute.useLoaderData()
    return (
      <div data-testid="page">
        <ul data-testid="posts">
          {posts.current.map((p: string) => (
            <li>{p}</li>
          ))}
        </ul>
        <Outlet />
      </div>
    )
  },
})

// 2. Nested route under a layout, reading a param.
const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  loader: ({ params }: any) => {
    if (params.postId === 'missing') {
      throw notFound()
    }
    return { id: params.postId }
  },
  component: () => {
    const data = postRoute.useLoaderData()
    return <span data-testid="post">post:{data.current.id}</span>
  },
  notFoundComponent: () => <span data-testid="post">not found</span>,
})

// 3. Search params, plus a conditional -> {#if}.
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'search',
  validateSearch: (s: Record<string, unknown>) => ({
    q: (s.q as string) ?? '',
  }),
  component: () => {
    const search = searchRoute.useSearch()
    return (
      <div data-testid="page">
        {search.current.q ? (
          <b data-testid="q">q={search.current.q}</b>
        ) : (
          <i data-testid="q">empty</i>
        )}
      </div>
    )
  },
})

// 4. A route whose loader throws, caught by an errorComponent.
const boomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'boom',
  loader: () => {
    throw new Error('loader exploded')
  },
  component: () => <h1 data-testid="page">unreachable</h1>,
  errorComponent: () => <h1 data-testid="page">caught the error</h1>,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  postsRoute.addChildren([postRoute]),
  searchRoute,
  boomRoute,
])

const mount = (initial: string) => {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
  })
  render(RouterProvider, { props: { router } })
  return router
}

const squash = (id: string) =>
  screen.getByTestId(id).textContent?.replace(/\s+/g, '')

test('loader data renders through {#each}', async () => {
  mount('/posts')
  await waitFor(() => expect(squash('posts')).toBe('alphabetagamma'))
})

test('nested child route reads its own loader data', async () => {
  mount('/posts/42')
  await waitFor(() => expect(squash('post')).toBe('post:42'))
  // parent layout is still rendered
  expect(squash('posts')).toBe('alphabetagamma')
})

test('thrown notFound renders notFoundComponent', async () => {
  mount('/posts/missing')
  await waitFor(() => expect(squash('post')).toBe('notfound'))
})

test('search params render through a {#if}', async () => {
  mount('/search?q=hello')
  await waitFor(() => expect(squash('q')).toBe('q=hello'))
})

test('a throwing loader renders errorComponent', async () => {
  mount('/boom')
  await waitFor(() => expect(squash('page')).toBe('caughttheerror'))
})

test('navigating between routes via Link', async () => {
  mount('/')
  await waitFor(() => expect(squash('page')).toBe('Index'))
  await fireEvent.click(screen.getByText('posts'))
  await waitFor(() => expect(squash('posts')).toBe('alphabetagamma'))
})
