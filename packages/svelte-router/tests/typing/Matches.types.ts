import { expectTypeOf, test } from 'vitest'
import {
  MatchRoute,
  createRootRoute,
  createRoute,
  createRouter,
} from '../../src'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
})

const invoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'invoices',
  loader: () => [{ id: '1' }, { id: '2' }],
})

const invoicesIndexRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '/',
})

const invoiceRoute = createRoute({
  getParentRoute: () => invoicesRoute,
  path: '$invoiceId',
  validateSearch: () => ({ page: 0 }),
})

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_layout',
})

const commentsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: 'comments/$id',
  validateSearch: () => ({
    page: 0,
    search: '',
  }),
  loader: () =>
    [{ comment: 'one comment' }, { comment: 'two comment' }] as const,
})

const routeTree = rootRoute.addChildren([
  invoicesRoute.addChildren([invoicesIndexRoute, invoiceRoute]),
  indexRoute,
  layoutRoute.addChildren([commentsRoute]),
])

const _defaultRouter = createRouter({
  routeTree,
})

type DefaultRouter = typeof _defaultRouter

test('when matching a route with params', () => {
  expectTypeOf(MatchRoute<DefaultRouter, string, '/invoices/$invoiceId'>)
    .parameter(1)
    .toHaveProperty('to')
    .toEqualTypeOf<
      '/' | '.' | '..' | '/invoices' | '/invoices/$invoiceId' | '/comments/$id'
    >()
})
