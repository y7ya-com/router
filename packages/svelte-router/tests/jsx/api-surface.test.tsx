/**
 * Parity: the API surface that was missing vs react/solid/vue —
 * NotFoundRoute, RouterContextProvider, linkOptions, useLinkProps, and the
 * previously-unexported hooks.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  NotFoundRoute,
  Outlet,
  RouterContextProvider,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  linkOptions,
  useAwaited,
  useElementScrollRestoration,
  useLinkProps,
  useRouter,
  useTags,
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

// ----------------------------------------------------------------- exports

test('the full sibling-port surface is exported', () => {
  for (const [name, val] of Object.entries({
    NotFoundRoute,
    RouterContextProvider,
    linkOptions,
    useLinkProps,
    useAwaited,
    useElementScrollRestoration,
    useTags,
  })) {
    expect(val, name).toBeDefined()
  }
})

// ------------------------------------------------------------- linkOptions

test('linkOptions is an identity function', () => {
  const opts = linkOptions({ to: '/posts' } as any)
  expect(opts).toEqual({ to: '/posts' })
})

// ----------------------------------------------------------- NotFoundRoute

test('NotFoundRoute renders when no route matches', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const notFoundRoute = new NotFoundRoute({
    getParentRoute: () => root,
    component: () => <div data-testid="p">custom 404</div>,
  } as any)

  const router = createRouter({
    routeTree: root.addChildren([index]),
    notFoundRoute,
    history: createMemoryHistory({ initialEntries: ['/definitely-missing'] }),
  } as any)
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(at('p')).toBe('custom 404'))
})

// -------------------------------------------------- RouterContextProvider

test('RouterContextProvider provides the router without rendering Matches', async () => {
  const root = createRootRoute({
    component: () => <div data-testid="p">matched tree</div>,
  })
  const index = createRoute({ getParentRoute: () => root, path: '/' })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

  render(ContextOnlyShell as any, { props: { router } })

  // The custom shell rendered and could read the router from context…
  await waitFor(() => expect(at('shell')).toBe('/'))
  // …but no route tree was rendered, because we never placed <Matches/>.
  expect(screen.queryByTestId('p')).toBeNull()
})

// Module-scope TSX component used as the render root above.
function ContextOnlyShell(props: { router: any }) {
  return (
    <RouterContextProvider router={props.router}>
      <ShellInner />
    </RouterContextProvider>
  )
}

function ShellInner() {
  const router = useRouter()
  return <div data-testid="shell">{router.state.location.pathname}</div>
}

// ------------------------------------------------------------ useLinkProps

function LinkishButton(props: { to: string }) {
  const link = useLinkProps(() => ({ to: props.to }))
  return (
    <a data-testid="custom-link" {...link.attrs}>
      custom ({String(link.isActive)})
    </a>
  )
}

test('useLinkProps powers a custom link with href, active state and navigation', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <LinkishButton to="/about" />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const el = screen.getByTestId('custom-link')
  expect(el.getAttribute('href')).toBe('/about')
  expect(el.textContent).toContain('false')

  const { fireEvent } = await import('jsx-svelte/testing')
  await fireEvent.click(el)
  await waitFor(() => expect(at('p')).toBe('about'))
  expect(router.state.location.pathname).toBe('/about')
  // active state flipped reactively
  await waitFor(() => expect(el.textContent).toContain('true'))
})
