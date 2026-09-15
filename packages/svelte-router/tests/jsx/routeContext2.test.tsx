/**
 * Parity: `routeContext` (part 2) — the redirect and async permutation matrix,
 * plus nested-destination inheritance.
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
 * `/nested` parent + `/nested/about` (redirects) + `/nested/person` (renders).
 * `where` decides which hook throws the redirect.
 */
function nestedRedirectTree(where: 'beforeLoad' | 'loader') {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const nested = createRoute({
    getParentRoute: () => root,
    path: 'nested',
    beforeLoad: () => ({ nested: 'N' }),
    component: () => <Outlet />,
  })
  const about = createRoute({
    getParentRoute: () => nested,
    path: 'about',
    ...(where === 'beforeLoad'
      ? {
          beforeLoad: () => {
            throw redirect({ to: '/nested/person' })
          },
        }
      : {
          loader: () => {
            throw redirect({ to: '/nested/person' })
          },
        }),
  })
  const person = createRoute({
    getParentRoute: () => nested,
    path: 'person',
    beforeLoad: () => ({ person: 'P' }),
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

test.each(['beforeLoad', 'loader'] as const)(
  'nested destination keeps parent context after a redirect thrown in %s',
  async (where) => {
    mount(nestedRedirectTree(where), {}, '/nested/about')
    await waitFor(() => expect(at('c')).toBe('{"nested":"N","person":"P"}'))
  },
)

test.each(['beforeLoad', 'loader'] as const)(
  'context is present in a sibling after a redirect thrown in %s on first load',
  async (where) => {
    const root = createRootRouteWithContext<any>()({
      component: () => <Outlet />,
    })
    const index = createRoute({
      getParentRoute: () => root,
      path: '/',
      ...(where === 'beforeLoad'
        ? {
            beforeLoad: () => {
              throw redirect({ to: '/about' })
            },
          }
        : {
            loader: () => {
              throw redirect({ to: '/about' })
            },
          }),
    })
    const about = createRoute({
      getParentRoute: () => root,
      path: 'about',
      beforeLoad: () => ({ about: 'A' }),
      component: () => {
        const ctx = useRouteContext({ from: '/about' as any })
        return (
          <div data-testid="c">
            {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
          </div>
        )
      },
    })
    mount(root.addChildren([index, about]), { context: { base: 'B' } })
    await waitFor(() => expect(at('c')).toBe('{"about":"A","base":"B"}'))
  },
)

test.each(['beforeLoad', 'loader'] as const)(
  'context is present after navigating through a redirect thrown in %s',
  async (where) => {
    const root = createRootRouteWithContext<any>()({
      component: () => <Outlet />,
    })
    const index = createRoute({
      getParentRoute: () => root,
      path: '/',
      component: () => <div data-testid="c">index</div>,
    })
    const about = createRoute({
      getParentRoute: () => root,
      path: 'about',
      ...(where === 'beforeLoad'
        ? {
            beforeLoad: () => {
              throw redirect({ to: '/person' })
            },
          }
        : {
            loader: () => {
              throw redirect({ to: '/person' })
            },
          }),
    })
    const person = createRoute({
      getParentRoute: () => root,
      path: 'person',
      beforeLoad: () => ({ person: 'P' }),
      component: () => {
        const ctx = useRouteContext({ from: '/person' as any })
        return (
          <div data-testid="c">
            {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
          </div>
        )
      },
    })
    const router = mount(root.addChildren([index, about, person]), {
      context: { base: 'B' },
    })

    await waitFor(() => expect(at('c')).toBe('index'))
    await router.navigate({ to: '/about' })
    await waitFor(() => expect(at('c')).toBe('{"base":"B","person":"P"}'))
  },
)

test('a sleeping beforeLoad still yields context in the root route', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: async () => {
      await sleep()
      return { slowRoot: true }
    },
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
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('c')).toBe('{"slowRoot":true}'))
})

test('a sleeping loader does not disturb the context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => ({ a: 1 }),
    loader: async () => {
      await sleep()
      return 'ignored'
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
  await waitFor(() => expect(at('c')).toBe('{"a":1}'))
})

test('a grandchild inherits from both ancestors', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ r: 1 }),
    component: () => <Outlet />,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: () => ({ a: 2 }),
    component: () => <Outlet />,
  })
  const b = createRoute({
    getParentRoute: () => a,
    path: 'b',
    beforeLoad: () => ({ b: 3 }),
    component: () => <Outlet />,
  })
  const c = createRoute({
    getParentRoute: () => b,
    path: 'c',
    beforeLoad: () => ({ c: 4 }),
    component: () => {
      const ctx = useRouteContext({ from: '/a/b/c' as any })
      return (
        <div data-testid="c">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([a.addChildren([b.addChildren([c])])]), {}, '/a/b/c')
  await waitFor(() => expect(at('c')).toBe('{"a":2,"b":3,"c":4,"r":1}'))
})

// Module scope: beforeLoad is not extracted, but keeping the counter here
// matches the rule the components follow.
let stamp = 0

test("a parent's beforeLoad re-runs on sibling navigation", async () => {
  stamp = 0
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    beforeLoad: () => ({ stamp: ++stamp }),
    component: () => <Outlet />,
  })
  const one = createRoute({
    getParentRoute: () => parent,
    path: 'one',
    component: () => <div data-testid="c">one</div>,
  })
  const two = createRoute({
    getParentRoute: () => parent,
    path: 'two',
    component: () => <div data-testid="c">two</div>,
  })
  const router = mount(
    root.addChildren([parent.addChildren([one, two])]),
    {},
    '/p/one',
  )

  await waitFor(() => expect(at('c')).toBe('one'))
  const afterFirstLoad = stamp
  expect(afterFirstLoad).toBeGreaterThan(0)

  await router.navigate({ to: '/p/two' })
  await waitFor(() => expect(at('c')).toBe('two'))

  // beforeLoad re-runs for the shared parent — its context may depend on the
  // location, so it is recomputed rather than carried over.
  expect(stamp).toBeGreaterThan(afterFirstLoad)
  const parentMatch = router.state.matches.find(
    (m: any) => m.routeId === '/p',
  ) as any
  expect(parentMatch.context).toMatchObject({ stamp })
})

test('router context is merged with beforeLoad context at every level', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: ({ context }: any) => ({
      chain: [...(context.chain ?? []), 'root'],
    }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => root,
    path: 'child',
    beforeLoad: ({ context }: any) => ({ chain: [...context.chain, 'child'] }),
    component: () => {
      const ctx = useRouteContext({ from: '/child' as any })
      return <div data-testid="c">{ctx.current.chain.join('>')}</div>
    },
  })
  mount(root.addChildren([child]), { context: { chain: ['router'] } }, '/child')
  await waitFor(() => expect(at('c')).toBe('router>root>child'))
})
