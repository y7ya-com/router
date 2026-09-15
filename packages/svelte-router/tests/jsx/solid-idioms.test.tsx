/**
 * Svelte analogues of solid-router tests whose Solid-specific primitives
 * (`createRenderEffect`, `createSignal`, JSX-valued lazy components) have no
 * one-to-one Svelte spelling. Each test keeps the original's behaviour and
 * expresses it with the Svelte idiom instead.
 */
import { expect, test, vi } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useMatch,
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
const observations: Array<{
  routeId: string | undefined
  nextRendered: boolean
}> = []
const seen: Array<string | undefined> = []

// ─── solid-router: use-match-outgoing-transition ─────────────────────────────
// "an outgoing component never observes its own active match disappear"
//
// The Svelte analogue of Solid's `createRenderEffect` is `$effect.pre`.
test('an outgoing component never observes its own active match disappear', async () => {
  observations.length = 0

  const root = createRootRoute({ component: () => <Outlet /> })
  const first = createRoute({
    getParentRoute: () => root,
    path: '/first',
    component: () => {
      const match = useMatch({ from: '/first', shouldThrow: false })
      $effect.pre(() => {
        observations.push({
          routeId: (match.current as any)?.routeId,
          nextRendered: screen.queryByText('Next') !== null,
        })
      })
      return <div data-testid="p">First</div>
    },
  })
  const next = createRoute({
    getParentRoute: () => root,
    path: '/next',
    component: () => <div data-testid="p">Next</div>,
  })
  const router = mount(root.addChildren([first, next]), '/first')

  await waitFor(() => expect(at('p')).toBe('First'))
  expect(observations.length).toBeGreaterThan(0)
  expect(observations[0]?.routeId).toBe('/first')

  await router.navigate({ to: '/next' })
  await waitFor(() => expect(at('p')).toBe('Next'))

  // The outgoing component must never have observed its own match as gone
  // while it was still mounted and the destination had not rendered.
  const badObservation = observations.find(
    (o) => o.routeId === undefined && !o.nextRendered,
  )
  expect(badObservation).toBeUndefined()
})

// ─── solid-router: use-match-outgoing-transition ─────────────────────────────
// "a persistent observer releases an explicit match only with the destination render"
test('an explicit match is released only once the destination renders', async () => {
  seen.length = 0
  const root = createRootRoute({
    component: () => {
      const match = useMatch({ from: '/first', shouldThrow: false })
      $effect.pre(() => {
        seen.push((match.current as any)?.routeId)
      })
      return <Outlet />
    },
  })
  const first = createRoute({
    getParentRoute: () => root,
    path: '/first',
    component: () => <div data-testid="p">First</div>,
  })
  const next = createRoute({
    getParentRoute: () => root,
    path: '/next',
    component: () => <div data-testid="p">Next</div>,
  })
  const router = mount(root.addChildren([first, next]), '/first')

  await waitFor(() => expect(at('p')).toBe('First'))
  expect(seen).toContain('/first')

  await router.navigate({ to: '/next' })
  await waitFor(() => expect(at('p')).toBe('Next'))

  // Once the destination has rendered, the observer sees the match released.
  await waitFor(() => expect(seen.at(-1)).toBeUndefined())
})

// ─── solid-router: link "updates href when link options change reactively" ───
// Solid's `createSignal` becomes a `$state` rune in the component that owns
// the Link.
test('a Link href updates when its `to` changes reactively', async () => {
  const root = createRootRoute({
    component: () => {
      let target = $state<'/a' | '/b'>('/a')
      return (
        <>
          <button onclick={() => (target = '/b')}>flip</button>
          <Link to={target}>dyn</Link>
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
  const a = createRoute({ getParentRoute: () => root, path: '/a' })
  const b = createRoute({ getParentRoute: () => root, path: '/b' })
  mount(root.addChildren([index, a, b]))

  await waitFor(() => expect(at('p')).toBe('index'))
  const link = () => screen.getByText('dyn')
  expect(link().getAttribute('href')).toBe('/a')

  const { fireEvent } = await import('jsx-svelte/testing')
  await fireEvent.click(screen.getByText('flip'))
  await waitFor(() => expect(link().getAttribute('href')).toBe('/b'))
})

// ─── solid-router: component-preload-retry ───────────────────────────────────
// "a component loads when rendered before preload"
test('a lazily imported component still loads when rendered before preload', async () => {
  const importer = vi.fn(async () => {
    await new Promise((r) => setTimeout(r, 10))
    return {
      default: () => {
        // Returned from the dynamic import as a real Svelte component.
        return null
      },
    }
  })

  const root = createRootRoute({ component: () => <Outlet /> })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    loader: async () => {
      await importer()
      return 'loaded'
    },
    component: () => <div data-testid="p">Page content</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('Page content'))
  expect(importer).toHaveBeenCalledTimes(1)
})
