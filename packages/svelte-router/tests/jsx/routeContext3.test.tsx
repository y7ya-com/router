/**
 * Parity: `routeContext` (part 3) — context reaching loaders and head, the
 * async ordering matrix, and context under error/notFound boundaries.
 */
import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  HeadContent,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  notFound,
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

// ------------------------------------------------------ context into loaders

test('a loader receives the accumulated context', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ fromRoot: 'R' }),
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => ({ fromRoute: 'I' }),
    loader: ({ context }: any) =>
      `${context.base}|${context.fromRoot}|${context.fromRoute}`,
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return <div data-testid="p">{ctx.current.fromRoute}</div>
    },
  })
  const router = mount(root.addChildren([index]), { context: { base: 'B' } })

  await waitFor(() => expect(at('p')).toBe('I'))
  const match = router.state.matches.find((m: any) => m.routeId === '/') as any
  expect(match.loaderData).toBe('B|R|I')
})

test('a child loader sees the parent beforeLoad context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    beforeLoad: () => ({ parent: 'P' }),
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'c',
    loader: ({ context }: any) => context.parent,
    component: () => <div data-testid="p">child</div>,
  })
  const router = mount(
    root.addChildren([parent.addChildren([child])]),
    {},
    '/p/c',
  )

  await waitFor(() => expect(at('p')).toBe('child'))
  const match = router.state.matches.find(
    (m: any) => m.routeId === '/p/c',
  ) as any
  expect(match.loaderData).toBe('P')
})

test('head receives the route context', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => (
      <>
        <HeadContent />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => ({ pageTitle: 'From Context' }),
    head: ({ match }: any) => ({ meta: [{ title: match.context.pageTitle }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() => expect(document.title).toBe('From Context'))
})

// -------------------------------------------------------------- async order

test('a slow parent beforeLoad resolves before the child runs', async () => {
  const order: Array<string> = []
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const parent = createRoute({
    getParentRoute: () => root,
    path: 'p',
    beforeLoad: async () => {
      await sleep(30)
      order.push('parent')
      return { ready: true }
    },
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => parent,
    path: 'c',
    beforeLoad: ({ context }: any) => {
      order.push(`child:${context.ready}`)
      return {}
    },
    component: () => <div data-testid="p">child</div>,
  })
  mount(root.addChildren([parent.addChildren([child])]), {}, '/p/c')

  await waitFor(() => expect(at('p')).toBe('child'))
  expect(order).toEqual(['parent', 'child:true'])
})

test('sibling routes each compute their own context (guarded read)', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="idx">index</div>,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: () => ({ who: 'a' }),
    component: () => {
      const ctx = useRouteContext({ from: '/a' as any })
      return <div data-testid="ra">{ctx.current?.who ?? ''}</div>
    },
  })
  const b = createRoute({
    getParentRoute: () => root,
    path: 'b',
    beforeLoad: () => ({ who: 'b' }),
    component: () => {
      const ctx = useRouteContext({ from: '/b' as any })
      return <div data-testid="rb">{ctx.current?.who ?? ''}</div>
    },
  })
  const router = mount(root.addChildren([index, a, b]), {}, '/')

  await waitFor(() => expect(at('idx')).toBe('index'))
  await router.navigate({ to: '/a' })
  await waitFor(() => expect(at('ra')).toBe('a'))
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('rb')).toBe('b'))
})

// Match.svelte derives `match` rather than writing it from an $effect: an
// effect runs after the render pass, so the outgoing match would linger one
// full render while matchId already pointed at the incoming route, and the
// incoming component's `useRouteContext({from:'/b'}).current` would be
// undefined for that render. The guarded read above settles either way; this
// test asserts the value is there on the first render.
test('sibling context is populated before the incoming component renders', async () => {
  const root = createRootRouteWithContext<any>()({
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="idx">index</div>,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: () => ({ who: 'a' }),
    component: () => {
      const ctx = useRouteContext({ from: '/a' as any })
      return <div data-testid="ra">{ctx.current.who}</div>
    },
  })
  const b = createRoute({
    getParentRoute: () => root,
    path: 'b',
    beforeLoad: () => ({ who: 'b' }),
    component: () => {
      const ctx = useRouteContext({ from: '/b' as any })
      return <div data-testid="rb">{ctx.current.who}</div>
    },
  })
  const router = mount(root.addChildren([index, a, b]), {}, '/')

  await waitFor(() => expect(at('idx')).toBe('index'))
  await router.navigate({ to: '/a' })
  await waitFor(() => expect(at('ra')).toBe('a'))
  await router.navigate({ to: '/b' })
  await waitFor(() => expect(at('rb')).toBe('b'))
})

// -------------------------------------------------------- context + failures

test('context from the parent is available in an errorComponent sibling', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ shell: 'S' }),
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw new Error('boom')
    },
    component: () => <div data-testid="p">unreachable</div>,
    errorComponent: () => <div data-testid="p">errored</div>,
  })
  const other = createRoute({
    getParentRoute: () => root,
    path: 'other',
    component: () => {
      const ctx = useRouteContext({ from: '/other' as any })
      return <div data-testid="p">{ctx.current.shell}</div>
    },
  })
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const router = mount(root.addChildren([index, other]))

  await waitFor(() => expect(at('p')).toBe('errored'))
  await router.navigate({ to: '/other' })
  await waitFor(() => expect(at('p')).toBe('S'))
  spy.mockRestore()
})

test('context survives a notFound boundary render', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ shell: 'S' }),
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: () => {
      throw notFound()
    },
    component: () => <div data-testid="p">unreachable</div>,
    notFoundComponent: () => <div data-testid="p">missing</div>,
  })
  const other = createRoute({
    getParentRoute: () => root,
    path: 'other',
    component: () => {
      const ctx = useRouteContext({ from: '/other' as any })
      return <div data-testid="p">{ctx.current.shell}</div>
    },
  })
  const router = mount(root.addChildren([index, other]))

  await waitFor(() => expect(at('p')).toBe('missing'))
  await router.navigate({ to: '/other' })
  await waitFor(() => expect(at('p')).toBe('S'))
})

test('a beforeLoad returning nothing leaves the inherited context intact', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ kept: 'K' }),
    component: () => <Outlet />,
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    beforeLoad: () => undefined,
    component: () => {
      const ctx = useRouteContext({ from: '/' as any })
      return (
        <div data-testid="p">
          {JSON.stringify(ctx.current, Object.keys(ctx.current).sort())}
        </div>
      )
    },
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('{"kept":"K"}'))
})

test('deeply nested contexts merge in declaration order', async () => {
  const root = createRootRouteWithContext<any>()({
    beforeLoad: () => ({ level: 'root', root: true }),
    component: () => <Outlet />,
  })
  const a = createRoute({
    getParentRoute: () => root,
    path: 'a',
    beforeLoad: () => ({ level: 'a', a: true }),
    component: () => <Outlet />,
  })
  const b = createRoute({
    getParentRoute: () => a,
    path: 'b',
    beforeLoad: () => ({ level: 'b', b: true }),
    component: () => {
      const ctx = useRouteContext({ from: '/a/b' as any })
      const c = ctx.current
      return (
        <div data-testid="p">
          {`${c.level}:${String(c.root)}${String(c.a)}${String(c.b)}`}
        </div>
      )
    },
  })
  mount(root.addChildren([a.addChildren([b])]), {}, '/a/b')
  await waitFor(() => expect(at('p')).toBe('b:truetruetrue'))
})

test('router context is visible to a beforeLoad at every level', async () => {
  const seen: Array<string> = []
  const root = createRootRouteWithContext<any>()({
    beforeLoad: ({ context }: any) => {
      seen.push(`root:${context.token}`)
      return {}
    },
    component: () => <Outlet />,
  })
  const child = createRoute({
    getParentRoute: () => root,
    path: 'child',
    beforeLoad: ({ context }: any) => {
      seen.push(`child:${context.token}`)
      return {}
    },
    component: () => <div data-testid="p">child</div>,
  })
  mount(root.addChildren([child]), { context: { token: 'T' } }, '/child')

  await waitFor(() => expect(at('p')).toBe('child'))
  expect(seen).toContain('root:T')
  expect(seen).toContain('child:T')
})
