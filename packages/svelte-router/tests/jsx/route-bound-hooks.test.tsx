/**
 * Route-bound hooks (`Route.useParams`, `Route.useSearch`, `Route.useMatch`)
 * forward every option, including `shouldThrow`, to the standalone hooks.
 */
import { expect, test } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'

function InactiveRouteReader() {
  const params = postRoute.useParams({ shouldThrow: false })
  const search = postRoute.useSearch({ shouldThrow: false })
  const match = postRoute.useMatch({ shouldThrow: false })
  return (
    <div>
      <span data-testid="params">{params.current ? 'set' : 'none'}</span>
      <span data-testid="search">{search.current ? 'set' : 'none'}</span>
      <span data-testid="match">{match.current ? 'set' : 'none'}</span>
    </div>
  )
}

const rootRoute = createRootRoute({ component: () => <Outlet /> })
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    let show = $state(false)
    return (
      <div>
        <div data-testid="p">index</div>
        <button onclick={() => (show = true)}>show</button>
        {show && <InactiveRouteReader />}
      </div>
    )
  },
})
const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts/$postId',
  component: () => <div data-testid="p">post</div>,
})

test('shouldThrow: false on route-bound hooks returns undefined for an inactive route', async () => {
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, postRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(screen.getByTestId('p').textContent).toBe('index'))
  await waitFor(() => expect(router.state.status).toBe('idle'))

  // Read after the router has settled, when a missing match would throw.
  await fireEvent.click(screen.getByText('show'))
  expect(screen.getByTestId('params').textContent).toBe('none')
  expect(screen.getByTestId('search').textContent).toBe('none')
  expect(screen.getByTestId('match').textContent).toBe('none')
})
