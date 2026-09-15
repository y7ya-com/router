/**
 * Parity: `Scripts` / `HeadContent` and route `head` options.
 *
 * These are the head-management surface: per-route meta/title/links, the single
 * HeadContent slot, and the Scripts placeholder.
 */
import { expect, test } from 'vitest'
import { render, screen, waitFor } from 'jsx-svelte/testing'
import {
  HeadContent,
  Outlet,
  RouterProvider,
  Scripts,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
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

test('HeadContent renders without throwing', async () => {
  const root = createRootRoute({
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
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('a route head title reaches the document', async () => {
  const root = createRootRoute({
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
    head: () => ({ meta: [{ title: 'Index Title' }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() => expect(document.title).toBe('Index Title'))
})

test('the title updates when navigating', async () => {
  const root = createRootRoute({
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
    head: () => ({ meta: [{ title: 'First' }] }),
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: 'about',
    head: () => ({ meta: [{ title: 'Second' }] }),
    component: () => <div data-testid="p">about</div>,
  })
  const router = mount(root.addChildren([index, about]))

  await waitFor(() => expect(document.title).toBe('First'))
  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))
  await waitFor(() => expect(document.title).toBe('Second'))
})

test('a route head meta tag is rendered', async () => {
  const root = createRootRoute({
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
    head: () => ({
      meta: [{ name: 'description', content: 'a parity description' }],
    }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head
        .querySelector('meta[name="description"]')
        ?.getAttribute('content'),
    ).toBe('a parity description'),
  )
})

test('a child head overrides the parent title', async () => {
  const root = createRootRoute({
    head: () => ({ meta: [{ title: 'Root Title' }] }),
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
    head: () => ({ meta: [{ title: 'Child Title' }] }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() => expect(document.title).toBe('Child Title'))
})

// HeadContent's duplicate guard reads `headSlotContextKey`. RouterProvider
// seeds it (guarded with hasContext so it never shadows an SSR scaffold's
// already-claimed slot), so the dedupe also holds in SPAs, where no scaffold
// exists.
test('a stray HeadContent in a child route does not double the meta', async () => {
  // The real footgun: the scaffold already renders HeadContent and the user
  // adds another one further down the tree.
  const root = createRootRoute({
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
    head: () => ({ meta: [{ name: 'dup-check', content: 'once' }] }),
    component: () => (
      <>
        <HeadContent />
        <div data-testid="p">index</div>
      </>
    ),
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head.querySelectorAll('meta[name="dup-check"]').length,
    ).toBe(1),
  )
})

test('Scripts renders without throwing', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <Outlet />
        <Scripts />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))
  await waitFor(() => expect(at('p')).toBe('index'))
})

test('a route head links entry is rendered', async () => {
  const root = createRootRoute({
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
    head: () => ({
      links: [{ rel: 'canonical', href: 'https://example.com/parity' }],
    }),
    component: () => <div data-testid="p">index</div>,
  })
  mount(root.addChildren([index]))

  await waitFor(() => expect(at('p')).toBe('index'))
  await waitFor(() =>
    expect(
      document.head
        .querySelector('link[rel="canonical"]')
        ?.getAttribute('href'),
    ).toBe('https://example.com/parity'),
  )
})

test('applies assetCrossOrigin to manifest stylesheets and preloads', async () => {
  const root = createRootRoute({
    component: () => (
      <>
        <HeadContent
          assetCrossOrigin={{
            script: 'anonymous',
            stylesheet: 'use-credentials',
          }}
        />
        <Outlet />
      </>
    ),
  })
  const index = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => <div data-testid="p">index</div>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.ssr = {
    manifest: {
      routes: { [root.id]: { css: ['/main.css'], preloads: ['/main.js'] } },
    },
  }
  await router.load()
  render(RouterProvider, { props: { router } })

  await waitFor(() => {
    expect(
      document.head
        .querySelector('link[rel="stylesheet"][href="/main.css"]')
        ?.getAttribute('crossorigin'),
    ).toBe('use-credentials')
    expect(
      document.head
        .querySelector('link[rel="modulepreload"][href="/main.js"]')
        ?.getAttribute('crossorigin'),
    ).toBe('anonymous')
  })
})

test('keeps SSR-rendered route stylesheets but drops their preloads after navigation', async () => {
  const root = createRootRoute({
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
    component: () => <div data-testid="p">index</div>,
  })
  const about = createRoute({
    getParentRoute: () => root,
    path: '/about',
    component: () => <div data-testid="p">about</div>,
  })
  const router = createRouter({
    routeTree: root.addChildren([index, about]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  router.ssr = {
    manifest: {
      routes: { [index.id]: { css: ['/index.css'], preloads: ['/index.js'] } },
    },
  }
  await router.load()
  render(RouterProvider, { props: { router } })

  const stylesheets = () =>
    document.head.querySelectorAll('link[rel="stylesheet"][href="/index.css"]')
  const preloads = () =>
    document.head.querySelectorAll(
      'link[rel="modulepreload"][href="/index.js"]',
    )

  await waitFor(() => {
    expect(stylesheets()).toHaveLength(1)
    expect(preloads()).toHaveLength(1)
  })

  await router.navigate({ to: '/about' })
  await waitFor(() => expect(at('p')).toBe('about'))

  expect(stylesheets()).toHaveLength(1)
  expect(preloads()).toHaveLength(0)
})
