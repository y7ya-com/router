/**
 * `ScrollRestoration` and `useElementScrollRestoration` turn on router-core's
 * scroll restoration and read its per-element entries.
 */
import { beforeEach, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useElementScrollRestoration,
} from '@tanstack/svelte-router'

beforeEach(() => {
  window.history.scrollRestoration = 'auto'
})

function mount(routeTree: any) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(RouterProvider, { props: { router } })
  return router
}

test('<ScrollRestoration/> switches the browser to manual scroll restoration', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const root = createRootRoute({
    component: () => (
      <>
        <ScrollRestoration />
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
  await waitFor(() => expect(screen.getByTestId('p').textContent).toBe('index'))
  expect(window.history.scrollRestoration).toBe('manual')
  warn.mockRestore()
})

test('useElementScrollRestoration returns the saved position after a round trip', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const entry = useElementScrollRestoration({ id: 'list' })
      return (
        <div>
          <div data-testid="list" data-scroll-restoration-id="list">
            list
          </div>
          <span data-testid="entry">
            {entry ? String(entry.scrollY) : 'none'}
          </span>
          <Link to="/other">other</Link>
        </div>
      )
    },
  })
  const other = createRoute({
    getParentRoute: () => root,
    path: 'other',
    component: () => (
      <div>
        <span data-testid="p">other</span>
        <Link to="/">back</Link>
      </div>
    ),
  })
  const router = mount(root.addChildren([index, other]))
  await waitFor(() =>
    expect(screen.getByTestId('entry').textContent).toBe('none'),
  )
  expect(window.history.scrollRestoration).toBe('manual')

  const list = screen.getByTestId('list')
  list.scrollTop = 120
  await fireEvent.scroll(list)

  await fireEvent.click(screen.getByText('other'))
  await waitFor(() => expect(screen.getByTestId('p').textContent).toBe('other'))

  // Going back restores the original history entry, whose saved position the
  // hook now reports.
  router.history.back()
  await waitFor(() =>
    expect(screen.getByTestId('entry').textContent).toBe('120'),
  )
})
