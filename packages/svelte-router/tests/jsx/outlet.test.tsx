/**
 * Parity: solid-router/tests/Outlet.test.tsx and the CatchBoundary diagnostic
 * test. An `<Outlet />` rendered inside a pending, error or not-found
 * component warns in development.
 */
import { afterEach, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import { createControlledPromise, notFound } from '@tanstack/router-core'
import {
  CatchBoundary,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'

const outletWarning = (
  component: 'pendingComponent' | 'errorComponent' | 'notFoundComponent',
) =>
  `Warning: An <Outlet /> was rendered inside a ${component}. <Outlet /> should only be rendered inside a route component.`

afterEach(() => {
  vi.restoreAllMocks()
})

test('does not warn when Outlet is rendered inside a route component', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <span>Root route</span>
        <Outlet />
      </>
    ),
  })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <span>Index route</span>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(RouterProvider, { props: { router } })

  await screen.findByText('Index route')
  expect(warn).not.toHaveBeenCalled()
})

test('warns when Outlet is rendered inside a pendingComponent', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const pending = createControlledPromise<void>()
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <span>Index route</span>,
  })
  const pendingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pending',
    loader: () => pending,
    pendingMs: 0,
    pendingComponent: () => (
      <>
        <span>Pending route</span>
        <Outlet />
      </>
    ),
    component: () => <span>Resolved route</span>,
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, pendingRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(RouterProvider, { props: { router } })
  await screen.findByText('Index route')

  const navigation = router.navigate({ to: '/pending' })
  await screen.findByText('Pending route')
  pending.resolve()
  await navigation

  expect(warn).toHaveBeenCalledWith(outletWarning('pendingComponent'))
})

test('warns when Outlet is rendered inside an errorComponent', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    loader: () => {
      throw new Error('Loader failed')
    },
    errorComponent: () => (
      <>
        <span>Error route</span>
        <Outlet />
      </>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(RouterProvider, { props: { router } })

  await screen.findByText('Error route')
  expect(warn).toHaveBeenCalledWith(outletWarning('errorComponent'))
})

test('warns when Outlet is rendered inside a notFoundComponent', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <span>Index route</span>,
  })
  const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/not-found',
    component: () => {
      throw notFound()
    },
    notFoundComponent: () => (
      <>
        <span>Not found route</span>
        <Outlet />
      </>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, notFoundRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(RouterProvider, { props: { router } })
  await screen.findByText('Index route')
  await router.navigate({ to: '/not-found' })

  await screen.findByText('Not found route')
  expect(warn).toHaveBeenCalledWith(outletWarning('notFoundComponent'))
})

test('keeps the Outlet diagnostic context after a route render throws', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const rootRoute = createRootRoute({ component: Outlet })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => {
      throw new Error('Render failed')
    },
    errorComponent: () => (
      <>
        <span>Render fallback</span>
        <Outlet />
      </>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(RouterProvider, { props: { router } })

  await screen.findByText('Render fallback')
  expect(warn).toHaveBeenCalledWith(outletWarning('errorComponent'))
})

let shouldThrow = true
const MaybeBroken = () => {
  if (shouldThrow) {
    throw new Error('Render failed')
  }
  return <span>Recovered</span>
}
const Retry = (props: { reset: () => void }) => (
  <button
    onclick={() => {
      shouldThrow = false
      props.reset()
    }}
  >
    retry
  </button>
)
const BoundaryWithDefault = () => (
  <CatchBoundary getResetKey={() => 0}>
    <MaybeBroken />
  </CatchBoundary>
)
const BoundaryWithReset = () => (
  <CatchBoundary getResetKey={() => 0} errorComponent={Retry}>
    <MaybeBroken />
  </CatchBoundary>
)

test('CatchBoundary renders the default ErrorComponent without an errorComponent', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  shouldThrow = true
  render(BoundaryWithDefault)
  await screen.findByText('Something went wrong!')
})

test('CatchBoundary passes a working reset to its errorComponent', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  shouldThrow = true
  render(BoundaryWithReset)
  await fireEvent.click(await screen.findByText('retry'))
  await waitFor(() => expect(screen.getByText('Recovered')).toBeTruthy())
})
