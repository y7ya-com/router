/**
 * Parity: `routeContext` (part 4, final) — the remaining redirect × sleep
 * permutations and nested-destination variants.
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

const sleep = (ms = 15) => new Promise((r) => setTimeout(r, ms))
const at = (id: string) => screen.getByTestId(id).textContent

function mount(routeTree: any, extra: any = {}, initial = '/') {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initial] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

/**
 * `/nested` parent, `/nested/about` redirecting to `/nested/person`, and
 * `/nested/person` rendering its merged context. `slow` decides whether the
 * hooks await first; `where` decides which hook redirects.
 */
function tree(where: 'beforeLoad' | 'loader', slow: boolean) {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const nested = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    beforeLoad: async () => {
      if (slow) {
        await sleep()
      }
      return { nested: 'N' }
    },
    component: () => <Outlet />,
  })
  const redirecting = async () => {
    if (slow) {
      await sleep()
    }
    throw redirect({ to: '/nested/person' })
  }
  const about = createRoute({
    getParentRoute: () => nested,
    path: 'about',
    ...(where === 'beforeLoad'
      ? { beforeLoad: redirecting }
      : { loader: redirecting }),
  })
  const person = createRoute({
    getParentRoute: () => nested,
    path: 'person',
    beforeLoad: async () => {
      if (slow) {
        await sleep()
      }
      return { person: 'P' }
    },
    component: () => {
      const ctx = useRouteContext({ from: '/nested/person' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  return root.addChildren([nested.addChildren([about, person])])
}

test.each([
  ['beforeLoad', false],
  ['beforeLoad', true],
  ['loader', false],
  ['loader', true],
] as const)(
  'redirect in %s (slow=%s) preserves the nested parent context',
  async (where, slow) => {
    mount(tree(where, slow), { context: { base: 'B' } }, '/nested/about')
    await waitFor(
      () => expect(at('c')).toBe('{"base":"B","nested":"N","person":"P"}'),
      { timeout: 3000 },
    )
  },
)

test.each([
  ['beforeLoad', false],
  ['beforeLoad', true],
  ['loader', false],
  ['loader', true],
] as const)(
  'redirect in %s (slow=%s) also works when navigating in',
  async (where, slow) => {
    const routeTree = tree(where, slow)
    const router = mount(
      routeTree,
      { context: { base: 'B' } },
      '/nested/person',
    )

    await waitFor(
      () => expect(at('c')).toBe('{"base":"B","nested":"N","person":"P"}'),
      {
        timeout: 3000,
      },
    )
    await router.navigate({ to: '/nested/about' })
    await waitFor(
      () => expect(at('c')).toBe('{"base":"B","nested":"N","person":"P"}'),
      { timeout: 3000 },
    )
  },
)

test('a redirect out of a layout keeps the layout context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const layout = createRoute({
    getParentRoute: () => root,
    id: '_shell',
    beforeLoad: () => ({ shell: 'S' }),
    component: () => <Outlet />,
  })
  const gated = createRoute({
    getParentRoute: () => layout,
    path: 'gated',
    beforeLoad: () => {
      throw redirect({ to: '/open' })
    },
  })
  const open = createRoute({
    getParentRoute: () => layout,
    path: 'open',
    beforeLoad: () => ({ open: 'O' }),
    component: () => {
      const ctx = useRouteContext({ from: '/_shell/open' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([layout.addChildren([gated, open])]), {}, '/gated')
  await waitFor(() => expect(at('c')).toBe('{"open":"O","shell":"S"}'))
})

test('a two-hop redirect keeps context from every hop it passes through', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ r: 'R' }),
    component: () => <Outlet />,
  })
  const one = createRoute({
    getParentRoute: () => root,
    path: 'one',
    beforeLoad: () => {
      throw redirect({ to: '/two' })
    },
  })
  const two = createRoute({
    getParentRoute: () => root,
    path: 'two',
    beforeLoad: () => {
      throw redirect({ to: '/three' })
    },
  })
  const three = createRoute({
    getParentRoute: () => root,
    path: 'three',
    beforeLoad: () => ({ three: 'T' }),
    component: () => {
      const ctx = useRouteContext({ from: '/three' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([one, two, three]), {}, '/one')
  await waitFor(() => expect(at('c')).toBe('{"r":"R","three":"T"}'))
})

test('context is rebuilt correctly after navigating away and back', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: () => ({ who: 'a' }),
    component: () => {
      const ctx = useRouteContext({ from: '/a' as any })
      return <div data-testid="c">{ctx.current?.who ?? ''}</div>
    },
  })
  const b = createRoute({
    getParentRoute: () => root,
    path: 'b',
    beforeLoad: () => ({ who: 'b' }),
    component: () => {
      const ctx = useRouteContext({ from: '/b' as any })
      return <div data-testid="c">{ctx.current?.who ?? ''}</div>
    },
  })
  const router = mount(root.addChildren([a, b]), {}, '/a')

  await waitFor(() => expect(at('c')).toBe('a'))
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('c')).toBe('b'))
  await router.navigate({ to: '/a' })
  await waitFor(() => expect(at('c')).toBe('a'))
})

test('an async beforeLoad chain resolves top-down', async () => {
  const order: Array<string> = []
  const root = createRootRouteWithContext<any>()({
    beforeLoad: async () => {
      await sleep()
      order.push('root')
      return { r: 1 }
    },
    component: () => <Outlet />,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: async ({ context }: any) => {
      await sleep()
      order.push(`a:${context.r}`)
      return { a: 2 }
    },
    component: () => <Outlet />,
  })
  const b = createRoute({
    getParentRoute: () => a,
    path: 'b',
    beforeLoad: async ({ context }: any) => {
      await sleep()
      order.push(`b:${context.a}`)
      return {}
    },
    component: () => <div data-testid="c">leaf</div>,
  })
  mount(root.addChildren([a.addChildren([b])]), {}, '/a/b')

  await waitFor(() => expect(at('c')).toBe('leaf'))
  expect(order).toEqual(['root', 'a:1', 'b:2'])
})
