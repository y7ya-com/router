/**
 * Parity: the @tanstack/svelte-start family — the packages every other
 * framework has (start, start-client, start-server). Smoke-level: components
 * render, handlers exist, useServerFn follows redirects.
 */
import { expect, test, vi } from 'vitest'
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/svelte-router'
import { StartClient, hydrateStart } from '@tanstack/svelte-start-client'
// NOT imported from @tanstack/svelte-start-server: its `export * from
// '@tanstack/start-server-core'` reaches createStartHandler's dynamic
// `import('#tanstack-router-entry')`, which only the Start build plugin can
// resolve — it has no meaning in a jsdom test. The package re-exports these
// same two handlers from the adapter, which is what's asserted here; the
// package's own svelte-check + build (0 errors) validate its re-export wiring.
import {
  defaultRenderHandler,
  defaultStreamHandler,
} from '@tanstack/svelte-router/ssr/server'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import { useServerFn } from '@tanstack/svelte-start'

const at = (id: string) => screen.getByTestId(id).textContent

test('the start family exports its full surface', () => {
  for (const [name, val] of Object.entries({
    StartClient,
    hydrateStart,
    defaultRenderHandler,
    defaultStreamHandler,
    useServerFn,
  })) {
    expect(val, name).toBeDefined()
  }
})

test('StartClient renders the router tree and signals hydration complete', async () => {
  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">started</div>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  // Pre-load so RouterClient's dehydration path is skipped (there is no SSR
  // payload in jsdom); the wrapper's own contribution — the post-hydration
  // `$_TSR.h()` stream-cleanup signal — is observed via a stub.
  await router.load()
  const h = vi.fn()
  ;(window as any).$_TSR = { h }

  render(StartClient as any, { props: { router } })
  await waitFor(() => expect(at('p')).toBe('started'))
  await waitFor(() => expect(h).toHaveBeenCalled())
  delete (window as any).$_TSR
})

// Module scope: extracted components can't close over test-local bindings.
const serverFn = vi.fn(() => Promise.resolve('server says hi'))
const redirectingFn = vi.fn(() => Promise.reject(redirect({ to: '/landed' })))
let lastResult: string | undefined

test('useServerFn resolves a plain result and follows a redirect', async () => {
  lastResult = undefined
  const root = createRootRoute({
    component: () => {
      const callPlain = useServerFn(serverFn)
      const callRedirect = useServerFn(redirectingFn as any)
      return (
        <>
          <button
            onclick={async () => {
              lastResult = await callPlain()
            }}
          >
            plain
          </button>
          <button onclick={() => callRedirect()}>redir</button>
          <Outlet />
        </>
      )
    },
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const landed = createRoute({
    getParentRoute: () => root,
    path: 'landed',
    component: () => <div data-testid="p">landed</div>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index, landed]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  render(RouterProvider, { props: { router } })

  await waitFor(() => expect(at('p')).toBe('index'))
  await fireEvent.click(screen.getByText('plain'))
  await waitFor(() => expect(lastResult).toBe('server says hi'))

  await fireEvent.click(screen.getByText('redir'))
  await waitFor(() => expect(at('p')).toBe('landed'))
  expect(router.state.location.pathname).toBe('/landed')
})
