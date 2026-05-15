import { afterEach, describe, expect, test, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/svelte'
import { createRawSnippet } from 'svelte'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  notFound,
  redirect,
} from '../src'
import RootComponent from './fixtures/RootComponent.svelte'
import { _testState } from './fixtures/shared.svelte'

afterEach(() => {
  window.history.replaceState(null, 'root', '/')
  cleanup()
})

const indexSnippet = createRawSnippet(() => ({
  render: () => '<h1>Index</h1>',
}))

const postsSnippet = createRawSnippet(() => ({
  render: () => '<h1>Posts Title</h1>',
}))

const otherSnippet = createRawSnippet(() => ({
  render: () => '<h1>Other Title</h1>',
}))

const loadingSnippet = createRawSnippet(() => ({
  render: () => '<p>Loading...</p>',
}))

const notFoundSnippet = createRawSnippet(() => ({
  render: () => '<h1>Not Found Title</h1>',
}))

function setup({
  beforeLoad,
  loader,
  head,
  headers,
  scripts,
  defaultPendingMs,
  defaultPendingMinMs,
  staleTime,
}: {
  beforeLoad?: () => any
  loader?: () => any
  head?: () => any
  headers?: () => any
  scripts?: () => any
  defaultPendingMs?: number
  defaultPendingMinMs?: number
  staleTime?: number
}) {
  _testState.select = vi.fn() as typeof _testState.select

  const rootRoute = createRootRoute({
    component: RootComponent,
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: indexSnippet,
  })

  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/posts',
    beforeLoad,
    loader,
    head,
    headers,
    scripts,
    component: postsSnippet,
  })

  const otherRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/other',
    component: otherSnippet,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, postsRoute, otherRoute]),
    defaultPendingMs,
    defaultPendingMinMs,
    defaultPendingComponent: loadingSnippet,
    defaultNotFoundComponent: notFoundSnippet,
    defaultPreload: 'intent',
    defaultStaleTime: staleTime,
    defaultGcTime: staleTime,
  })

  render(RouterProvider, { props: { router } })

  return { select: _testState.select, router }
}

async function back() {
  const link = await waitFor(() => screen.getByRole('link', { name: 'Back' }))
  fireEvent.click(link)
  const title = await waitFor(() =>
    screen.getByRole('heading', { name: /Index/ }),
  )
  expect(title).toBeInTheDocument()
}

async function run({ select }: ReturnType<typeof setup>) {
  const link = await waitFor(() => screen.getByRole('link', { name: 'Posts' }))
  const before = select.mock.calls.length
  fireEvent.click(link)
  const title = await waitFor(() =>
    screen.getByRole('heading', { name: /Title$/ }),
  )
  expect(title).toBeInTheDocument()
  const after = select.mock.calls.length

  return after - before
}

function resolveAfter(ms: number, value: any) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(value), ms))
}

describe("Store doesn't update *too many* times during navigation", () => {
  test('async loader, async beforeLoad, pendingMs', async () => {
    const params = setup({
      beforeLoad: () => resolveAfter(100, { foo: 'bar' }),
      loader: () => resolveAfter(100, { hello: 'world' }),
      defaultPendingMs: 100,
      defaultPendingMinMs: 300,
    })

    const updates = await run(params)
    expect(updates).toBe(8)
  })

  test('redirection in preload', async () => {
    const { select, router } = setup({
      loader: () => {
        throw redirect({ to: '/other' })
      },
    })

    const before = select.mock.calls.length
    await router.preloadRoute({ to: '/posts' })
    const after = select.mock.calls.length
    const updates = after - before
    expect(updates).toBe(1)
  })

  test('sync beforeLoad', async () => {
    const params = setup({
      beforeLoad: () => ({ foo: 'bar' }),
      loader: () => resolveAfter(100, { hello: 'world' }),
      defaultPendingMs: 100,
      defaultPendingMinMs: 300,
    })

    const updates = await run(params)
    expect(updates).toBe(5)
  })

  test('nothing', async () => {
    const params = setup({})
    const updates = await run(params)
    expect(updates).toBe(3)
  })

  test('not found in beforeLoad', async () => {
    const params = setup({
      beforeLoad: () => {
        throw notFound()
      },
    })

    const updates = await run(params)
    expect(updates).toBe(4)
  })

  test('hover preload, then navigate, w/ async loaders', async () => {
    const { select } = setup({
      beforeLoad: () => Promise.resolve({ foo: 'bar' }),
      loader: () => resolveAfter(100, { hello: 'world' }),
    })

    const link = await waitFor(() =>
      screen.getByRole('link', { name: 'Posts' }),
    )
    const before = select.mock.calls.length
    fireEvent.focus(link)
    await new Promise((resolve) => setTimeout(resolve, 50))
    fireEvent.click(link)
    const title = await waitFor(() =>
      screen.getByRole('heading', { name: /Title$/ }),
    )
    expect(title).toBeInTheDocument()
    const after = select.mock.calls.length
    const updates = after - before
    expect(updates).toBe(3)
  })

  test('navigate, w/ preloaded & async loaders', async () => {
    const params = setup({
      beforeLoad: () => Promise.resolve({ foo: 'bar' }),
      loader: () => resolveAfter(100, { hello: 'world' }),
      staleTime: 1000,
    })

    await params.router.preloadRoute({ to: '/posts' })
    const updates = await run(params)
    expect(updates).toBe(3)
  })

  test('navigate, w/ preloaded & sync loaders', async () => {
    const params = setup({
      beforeLoad: () => ({ foo: 'bar' }),
      loader: () => ({ hello: 'world' }),
      staleTime: 1000,
    })

    await params.router.preloadRoute({ to: '/posts' })
    const updates = await run(params)
    expect(updates).toBe(3)
  })

  test('navigate, w/ previous navigation & async loader', async () => {
    const params = setup({
      loader: () => resolveAfter(100, { hello: 'world' }),
      staleTime: 1000,
    })

    await run(params)
    await back()
    const updates = await run(params)
    expect(updates).toBe(3)
  })

  test('preload a preloaded route w/ async loader', async () => {
    const params = setup({
      loader: () => resolveAfter(100, { hello: 'world' }),
    })

    await params.router.preloadRoute({ to: '/posts' })
    await new Promise((r) => setTimeout(r, 20))
    const before = params.select.mock.calls.length
    await params.router.preloadRoute({ to: '/posts' })
    const after = params.select.mock.calls.length
    const updates = after - before
    expect(updates).toBe(0)
  })
})
