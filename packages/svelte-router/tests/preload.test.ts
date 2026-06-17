import { afterEach, expect, test, vi } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '../src'

afterEach(() => {
  window.history.replaceState(null, 'root', '/')
  cleanup()
})

// Mirrors the kitchen-sink demo: an active intermediate layout (`/posts`) with
// `/posts/$postId` as its child, and a loader on each.
function makeRouter() {
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
  const lag = () => new Promise((r) => setTimeout(r, 20))
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'posts',
    loader: async () => {
      await lag()
      return ['post-1', 'post-2']
    },
  })
  const postIdRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId',
    loader: async ({ params }: { params: { postId: string } }) => {
      await lag()
      return { id: params.postId }
    },
  })
  return createRouter({
    routeTree: rootRoute.addChildren([
      indexRoute,
      postsRoute.addChildren([postIdRoute]),
    ]),
    defaultPreload: 'intent',
  })
}

test('preloadRoute a child of the active layout does not crash', async () => {
  const router = makeRouter()
  render(RouterProvider, { props: { router } })
  await router.navigate({ to: '/posts' })
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const result = await router.preloadRoute({
    to: '/posts/$postId',
    params: { postId: '1' },
  })
  expect(errSpy).not.toHaveBeenCalled()
  expect(result).toBeDefined()
  errSpy.mockRestore()
})

test('concurrent preloads of sibling children do not crash', async () => {
  const router = makeRouter()
  render(RouterProvider, { props: { router } })
  await router.navigate({ to: '/posts' })
  const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  // Hovering several post links at once, like the demo's list.
  await Promise.all(
    ['1', '2', '3', '4', '5', '6'].map((postId) =>
      router.preloadRoute({ to: '/posts/$postId', params: { postId } }),
    ),
  )
  expect(errSpy).not.toHaveBeenCalled()
  errSpy.mockRestore()
})
