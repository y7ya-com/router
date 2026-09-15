/**
 * The `Link` options that reach the router or the preload scheduler:
 * `preloadDelay`, `reloadDocument`, `hashScrollIntoView`, `startTransition`,
 * `viewTransition`. Mirrors solid-router's link suite for the same props.
 */
import { afterEach, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from 'jsx-svelte/testing'
import {
  Link,
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'

afterEach(() => {
  vi.useRealTimers()
})

function mount(routeTree: any, extra: any = {}) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
    ...extra,
  })
  render(RouterProvider, { props: { router } })
  return router
}

const root = createRootRoute({ component: () => <Outlet /> })
const about = createRoute({
  getParentRoute: () => root,
  path: 'about',
  component: () => <div data-testid="p">about</div>,
})

test('intent preload waits for preloadDelay and is cancelled on leave', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link to="/about" preload="intent" preloadDelay={50}>
        about
      </Link>
    ),
  })
  const router = mount(root.addChildren([index, about]))
  const link = await screen.findByRole('link', { name: 'about' })
  const spy = vi.spyOn(router, 'preloadRoute')
  vi.useFakeTimers()

  await fireEvent.mouseEnter(link)
  expect(spy).not.toHaveBeenCalled()
  await fireEvent.mouseLeave(link)
  vi.advanceTimersByTime(100)
  expect(spy).not.toHaveBeenCalled()

  await fireEvent.mouseEnter(link)
  vi.advanceTimersByTime(49)
  expect(spy).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('preloadDelay={0} preloads immediately on intent', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link to="/about" preload="intent" preloadDelay={0}>
        about
      </Link>
    ),
  })
  const router = mount(root.addChildren([index, about]))
  const link = await screen.findByRole('link', { name: 'about' })
  const spy = vi.spyOn(router, 'preloadRoute')
  await fireEvent.mouseEnter(link)
  expect(spy).toHaveBeenCalledTimes(1)
})

test('reloadDocument disables preloading and hands the click to the browser', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link to="/about" preload="intent" preloadDelay={0} reloadDocument>
        about
      </Link>
    ),
  })
  const router = mount(root.addChildren([index, about]))
  const link = await screen.findByRole('link', { name: 'about' })
  const preloadSpy = vi.spyOn(router, 'preloadRoute')
  const navigateSpy = vi.spyOn(router, 'navigate')

  await fireEvent.mouseEnter(link)
  expect(preloadSpy).not.toHaveBeenCalled()
  expect(link.getAttribute('href')).toBe('/about')

  await fireEvent.click(link)
  expect(navigateSpy).toHaveBeenCalledTimes(1)
  expect(navigateSpy.mock.calls[0]![0]).toMatchObject({ reloadDocument: true })
})

test('hashScrollIntoView, startTransition and viewTransition reach navigate', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link
        to="/about"
        hash="section"
        hashScrollIntoView={{ behavior: 'smooth' }}
        startTransition
        viewTransition={{ types: ['slide'] }}
      >
        about
      </Link>
    ),
  })
  const router = mount(root.addChildren([index, about]))
  const link = await screen.findByRole('link', { name: 'about' })
  const navigateSpy = vi.spyOn(router, 'navigate')

  await fireEvent.click(link)
  expect(navigateSpy).toHaveBeenCalledTimes(1)
  expect(navigateSpy.mock.calls[0]![0]).toMatchObject({
    to: '/about',
    hash: 'section',
    hashScrollIntoView: { behavior: 'smooth' },
    startTransition: true,
    viewTransition: { types: ['slide'] },
  })
  await waitFor(() => expect(screen.getByTestId('p').textContent).toBe('about'))
})

test('none of the routing options leak onto the anchor', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link
        to="/about"
        preload="intent"
        preloadDelay={50}
        preloadIntentProximity={123}
        hashScrollIntoView
        startTransition
        viewTransition
        reloadDocument
        resetScroll
        ignoreBlocker
      >
        about
      </Link>
    ),
  })
  mount(root.addChildren([index, about]))
  const link = await screen.findByRole('link', { name: 'about' })
  for (const name of [
    'preload',
    'preloaddelay',
    'preloadintentproximity',
    'hashscrollintoview',
    'starttransition',
    'viewtransition',
    'reloaddocument',
    'resetscroll',
    'ignoreblocker',
    'to',
  ]) {
    expect(link.hasAttribute(name), name).toBe(false)
  }
})

test('a Link with an `href` option navigates to that href', async () => {
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => (
      <Link from="/" href="/about?x=1">
        go
      </Link>
    ),
  })
  const router = mount(root.addChildren([index, about]))

  const link = await screen.findByText('go')
  expect(link.getAttribute('href')).toBe('/about?x=1')
  await fireEvent.click(link)
  await waitFor(() => expect(screen.getByTestId('p').textContent).toBe('about'))
  expect(router.state.location.href).toBe('/about?x=1')
})
