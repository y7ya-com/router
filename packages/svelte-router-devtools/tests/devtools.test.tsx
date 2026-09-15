/**
 * Parity: @tanstack/svelte-router-devtools — the package every other
 * framework has. Smoke-level: the wrapper mounts the devtools core, renders
 * its UI into the DOM, and unmounts cleanly.
 */
import { expect, test } from 'vitest'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  TanStackRouterDevtools,
  TanStackRouterDevtoolsInProd,
} from '@tanstack/svelte-router-devtools'

const at = (id: string) => screen.getByTestId(id).textContent

test('the devtools component mounts inside a router tree', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Outlet />
        <TanStackRouterDevtoolsInProd />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  const { unmount } = render(RouterProvider, { props: { router } })

  await waitFor(() => expect(at('p')).toBe('index'))
  // The core injects its UI (a shadow-root host or container) into the page.
  await waitFor(() =>
    expect(
      document.querySelector('.TanStackRouterDevtools') ??
        document.querySelector(
          '[class*="tsr-"], tsr-devtools, #TanStackRouterDevtools',
        ),
    ).not.toBeNull(),
  )
  unmount()
})

test('the NODE_ENV switch exports a component either way', () => {
  expect(TanStackRouterDevtools).toBeDefined()
  expect(TanStackRouterDevtoolsInProd).toBeDefined()
})
