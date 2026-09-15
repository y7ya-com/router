import { createRootRoute, createRoute, createRouter } from '../../src'

const rootRoute = createRootRoute()
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
})
const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
})
const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invoices',
})
const invoiceRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '$invoiceId',
  validateSearch: (): { page?: number } => ({ page: 0 }),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  postsRoute.addChildren([postRoute]),
  invoicesRoute.addChildren([invoiceRoute]),
])

export const router = createRouter({ routeTree })

declare module '../../src' {
  interface Register {
    router: typeof router
  }
}
