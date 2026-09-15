import { createRawSnippet } from 'svelte'
import { createLazyFileRoute, createLazyRoute } from '../../src'

const lazyRouteSnippet = createRawSnippet(() => ({
  render: () => '<h1 data-testid="lazy-route-page">I\'m a normal route</h1>',
}))

const lazyFileRouteSnippet = createRawSnippet(() => ({
  render: () => "<h1>I'm a normal file route</h1>",
}))

export function Route(id: string) {
  return createLazyRoute(id)({
    component: lazyRouteSnippet,
  })
}

export function FileRoute(id: string) {
  return createLazyFileRoute(id as never)({
    component: lazyFileRouteSnippet,
  })
}
