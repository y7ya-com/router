import { afterEach, describe, expect, test } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/svelte'
import { QueryClient } from '@tanstack/svelte-query'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '../src'
import Posts from './fixtures/Posts.svelte'
import DirectHarness from './fixtures/DirectHarness.svelte'
import { postsQueryOptions, stats } from './fixtures/posts-query'

afterEach(() => {
  window.history.replaceState(null, 'root', '/')
  cleanup()
  stats.fetchCount = 0
})

function makeRouter() {
  const queryClient = new QueryClient()
  const rootRoute = createRootRoute()
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    loader: () => queryClient.ensureQueryData(postsQueryOptions()),
    component: Posts,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
  })
  setupRouterSsrQueryIntegration({ router, queryClient })
  return { router, queryClient }
}

describe('setupRouterSsrQueryIntegration', () => {
  test('sanity: createQuery reads a prefilled cache under QueryClientProvider', async () => {
    const client = new QueryClient()
    await client.ensureQueryData(postsQueryOptions())
    expect(stats.fetchCount).toBe(1)

    render(DirectHarness, { props: { client } })

    await waitFor(() =>
      expect(screen.getByTestId('posts')).toHaveTextContent('POSTS_FROM_QUERY'),
    )
    expect(stats.fetchCount).toBe(1)
  })

  test('installs the Wrap + hydrate hook on the router', () => {
    const { router } = makeRouter()
    expect(typeof router.options.Wrap).toBe('function')
    // The core sets `hydrate` on the client; `dehydrate` is server-only.
    expect(typeof router.options.hydrate).toBe('function')
  })

  test('loader prefetch + createQuery share one QueryClient (no refetch)', async () => {
    const { router } = makeRouter()

    await router.load()
    expect(stats.fetchCount).toBe(1)

    render(RouterProvider, { props: { router } })

    await waitFor(() =>
      expect(screen.getByTestId('posts')).toHaveTextContent('POSTS_FROM_QUERY'),
    )
    expect(stats.fetchCount).toBe(1)
  })
})
