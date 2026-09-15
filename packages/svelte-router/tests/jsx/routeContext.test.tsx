/**
 * Parity: `routeContext` — router context, beforeLoad context, inheritance
 * through layouts and nesting, and survival across redirects.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
  useRouteContext,
} from '@tanstack/svelte-router'

const sleep = (ms = 10) => new Promise((r) => setTimeout(r, ms))
const at = (id: string) => screen.getByTestId(id).textContent

// NOTE: no `show(from, id)` factory. A component that closes over factory
// parameters can't be extracted — it becomes its own module. Each component
// below is self-contained, with its `from` written as a literal.

function mount(routeTree: any, extra: any = {}, initial = '/') {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

// ------------------------------------------------------------- router context

test('receives an empty object when no context is given', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('c')).toBe('{}'))
})

test('receives the values passed to createRouter', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]), { context: { userId: 'u1' } })
  await waitFor(() => expect(at('c')).toBe('{"userId":"u1"}'))
})

test('router context is visible in the root route', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => {
      const ctx = useRouteContext({ from: '__root__' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  mount(root.addChildren([index]), { context: { a: 1 } })
  await waitFor(() => expect(at('c')).toBe('{"a":1}'))
})

// --------------------------------------------------------- beforeLoad context

test('beforeLoad context is merged into the route context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => ({ fromBeforeLoad: true }),
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]), { context: { base: 1 } })
  await waitFor(() => expect(at('c')).toBe('{"base":1,"fromBeforeLoad":true}'))
})

test('an async beforeLoad still contributes context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: async () => {
      await sleep()
      return { slow: 'yes' }
    },
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('c')).toBe('{"slow":"yes"}'))
})

test('a root beforeLoad contributes context to children', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ fromRoot: 'r' }),
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('c')).toBe('{"fromRoot":"r"}'))
})

// ------------------------------------------------------------- inheritance

test('a child inherits its parent route context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    beforeLoad: () => ({ parent: 'p' }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'about',
    beforeLoad: () => ({ child: 'c' }),
    component: () => {
      const ctx = useRouteContext({ from: '/nested/about' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([parent.addChildren([child])]), {}, '/nested/about')
  await waitFor(() => expect(at('c')).toBe('{"child":"c","parent":"p"}'))
})

test('a child inherits context through a pathless layout route', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const layout = createRoute({
    getParentRoute: () => root,
    id: '_layout',
    beforeLoad: () => ({ layout: 'L' }),
  })
  const index = createRoute({
    getParentRoute: () => layout,
    path: '/',
    component: () => {
      const ctx = useRouteContext({ from: '/_layout/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([layout.addChildren([index])]))
  await waitFor(() => expect(at('c')).toBe('{"layout":"L"}'))
})

test('a child overrides a parent key of the same name', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    beforeLoad: () => ({ who: 'parent' }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'about',
    beforeLoad: () => ({ who: 'child' }),
    component: () => {
      const ctx = useRouteContext({ from: '/nested/about' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([parent.addChildren([child])]), {}, '/nested/about')
  await waitFor(() => expect(at('c')).toBe('{"who":"child"}'))
})

test('a child sees an updated value produced by its parent', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    beforeLoad: ({ context }: any) => ({ count: (context.count ?? 0) + 1 }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'about',
    component: () => {
      const ctx = useRouteContext({ from: '/nested/about' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(
    root.addChildren([parent.addChildren([child])]),
    { context: { count: 41 } },
    '/nested/about',
  )
  await waitFor(() => expect(at('c')).toBe('{"count":42}'))
})

// ------------------------------------------------------ context and redirects

test('context is present after a redirect thrown in beforeLoad', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => {
      throw redirect({ to: '/about' })
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    beforeLoad: () => ({ page: 'about' }),
    component: () => {
      const ctx = useRouteContext({ from: '/about' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index, about]), { context: { base: 'b' } })
  await waitFor(() => expect(at('c')).toBe('{"base":"b","page":"about"}'))
})

test('context is present after a redirect thrown in a loader', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw redirect({ to: '/about' })
    },
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    beforeLoad: () => ({ page: 'about' }),
    component: () => {
      const ctx = useRouteContext({ from: '/about' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index, about]), { context: { base: 'b' } })
  await waitFor(() => expect(at('c')).toBe('{"base":"b","page":"about"}'))
})

test('layout-inherited context survives a redirect into a sibling', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const layout = createRoute({
    getParentRoute: () => root,
    id: '_layout',
    beforeLoad: () => ({ layout: 'L' }),
  })
  const about = createRoute({
    getParentRoute: () => layout,
    path: 'about',
    beforeLoad: () => {
      throw redirect({ to: '/person' })
    },
  })
  const person = createRoute({
    getParentRoute: () => layout,
    path: 'person',
    beforeLoad: () => ({ person: 'P' }),
    component: () => {
      const ctx = useRouteContext({ from: '/_layout/person' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([layout.addChildren([about, person])]), {}, '/about')
  await waitFor(() => expect(at('c')).toBe('{"layout":"L","person":"P"}'))
})

test('context from a sleeping loader is present once resolved', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => ({ ready: false }),
    loader: async () => {
      await sleep()
      return null
    },
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('c')).toBe('{"ready":false}'))
})
