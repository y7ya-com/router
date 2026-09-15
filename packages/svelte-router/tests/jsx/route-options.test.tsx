/**
 * Route and router options the adapter must honour: `remountDeps` /
 * `defaultRemountDeps`, `InnerWrap`, `notFoundRoute`, `shellComponent`, and
 * client-only mounting for `ssr: false` routes.
 */
import { onMount } from 'svelte'
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
  useParams,
} from '@tanstack/svelte-router'

const at = (id: string) => screen.getByTestId(id).textContent

function mount(routeTree: any, initial = '/', extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

// Module scope: extracted components can't close over test-local bindings.
let mounts = 0

test('remountDeps remounts the component when the deps change', async () => {
  mounts = 0
  const root = createRootRoute({ component: () => <Outlet /> })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    remountDeps: ({ params }) => params.postId,
    component: () => {
      const params = useParams({ from: '/posts/$postId' })
      onMount(() => {
        mounts++
      })
      return (
        <div>
          <span data-testid="p">{params.current?.postId}</span>
          <Link to="/posts/$postId" params={{ postId: '2' }}>
            two
          </Link>
        </div>
      )
    },
  })
  mount(root.addChildren([post]), '/posts/1')
  await waitFor(() => expect(at('p')).toBe('1'))
  expect(mounts).toBe(1)
  await fireEvent.click(screen.getByText('two'))
  await waitFor(() => expect(at('p')).toBe('2'))
  expect(mounts).toBe(2)
})

test('without remountDeps the component updates in place', async () => {
  mounts = 0
  const root = createRootRoute({ component: () => <Outlet /> })
  const post = createRoute({
    getParentRoute: () => root,
    path: 'posts/$postId',
    component: () => {
      const params = useParams({ from: '/posts/$postId' })
      onMount(() => {
        mounts++
      })
      return (
        <div>
          <span data-testid="p">{params.current?.postId}</span>
          <Link to="/posts/$postId" params={{ postId: '2' }}>
            two
          </Link>
        </div>
      )
    },
  })
  mount(root.addChildren([post]), '/posts/1')
  await waitFor(() => expect(at('p')).toBe('1'))
  await fireEvent.click(screen.getByText('two'))
  await waitFor(() => expect(at('p')).toBe('2'))
  expect(mounts).toBe(1)
})

function Wrapper(props: { children: any }) {
  return (
    <section data-testid="wrap">
      <span data-testid="wrapped">yes</span>
      {props.children}
    </section>
  )
}

test('router.options.InnerWrap wraps the match tree', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]), '/', { InnerWrap: Wrapper as any })
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(at('wrapped')).toBe('yes')
  expect(screen.getByTestId('wrap').contains(screen.getByTestId('p'))).toBe(
    true,
  )
})

test('the root shellComponent wraps the whole tree', async () => {
  const root = createRootRoute({
    component: () => <Outlet />,
    shellComponent: Wrapper as any,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
  expect(screen.getByTestId('wrap').contains(screen.getByTestId('p'))).toBe(
    true,
  )
})

test('notFoundRoute supplies the root not-found view for an unmatched path', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const nf = createRoute({
    getParentRoute: () => root,
    path: '404',
    component: () => <div data-testid="p">from-notFoundRoute</div>,
  })
  mount(root.addChildren([index, nf]), '/nope', { notFoundRoute: nf })
  await waitFor(() => expect(at('p')).toBe('from-notFoundRoute'))
})

test('an ssr:false route renders its pending view until mounted, then its component', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    ssr: false,
    pendingComponent: () => <div data-testid="p">pending</div>,
    component: () => <div data-testid="p">client-only</div>,
  })
  mount(root.addChildren([index]), '/', { defaultSsr: true } as any)
  await waitFor(() => expect(at('p')).toBe('client-only'))
})
