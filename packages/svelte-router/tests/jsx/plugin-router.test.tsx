/**
 * The goal: a hand-written TSX test, against the real @tanstack/svelte-router,
 * compiled to real Svelte at test time.
 *
 * Written in the shape vue-router's tests use — inline `component:` closures,
 * fragments, `<Link>`, `<Outlet/>` — with nothing generated or translated.
 */
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import { expect, test } from 'vitest'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'

const rootRoute = createRootRoute({
  component: () => (
    <>
      <nav>
        <Link to="/">home</Link>
        <Link to="/about">about</Link>
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

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: () => <h1 data-testid="page">About</h1>,
})

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts/$postId',
  // `postsRoute` is a module-scope const, not an import — the extracted
  // component imports it back from this file. Svelte's hooks return the rune
  // wrapper `{ readonly current }`, the adapter's equivalent of Solid's
  // `Accessor<T>`.
  component: () => {
    const params = postsRoute.useParams()
    return <h1 data-testid="page">Post {params.current.postId}</h1>
  },
})

function makeRouter(initial: string) {
  return createRouter({
    routeTree: rootRoute.addChildren([indexRoute, aboutRoute, postsRoute]),
    history: createMemoryHistory({ initialEntries: [initial] }),
  })
}

const page = () => screen.getByTestId('page').textContent

test('renders the matched route', async () => {
  render(RouterProvider, { props: { router: makeRouter('/') } })
  await waitFor(() => expect(page()).toBe('Index'))
})

test('navigates when a Link is clicked', async () => {
  render(RouterProvider, { props: { router: makeRouter('/') } })
  await waitFor(() => expect(page()).toBe('Index'))

  await fireEvent.click(screen.getByText('about'))
  await waitFor(() => expect(page()).toBe('About'))

  await fireEvent.click(screen.getByText('home'))
  await waitFor(() => expect(page()).toBe('Index'))
})

test('reads a dynamic path param', async () => {
  render(RouterProvider, { props: { router: makeRouter('/posts/42') } })
  await waitFor(() => expect(page()).toBe('Post 42'))
})
