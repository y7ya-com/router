import { createRootRoute, createRoute } from '@tanstack/svelte-router'
import { noop, normalizeFilter, normalizePage } from './perf'

export const rootRoute = createRootRoute()

export const itemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/items/$id',
  params: {
    parse: (params) => ({
      ...params,
      id: normalizePage(params.id),
    }),
    stringify: (params) => ({
      ...params,
      id: `${params.id}`,
    }),
  },
  onEnter: noop,
  onStay: noop,
  onLeave: noop,
})

export const itemDetailsRoute = createRoute({
  getParentRoute: () => itemsRoute,
  path: 'details',
})

export const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  validateSearch: (search: Record<string, unknown>) => ({
    page: normalizePage(search.page),
    filter: normalizeFilter(search.filter),
  }),
  search: {
    middlewares: [
      ({ search, next }) => {
        const result = next(search)
        return {
          page: result.page,
          filter: result.filter,
        }
      },
    ],
  },
  loaderDeps: ({ search }) => ({
    page: search.page,
    filter: search.filter,
  }),
  loader: ({ deps }) => ({
    seed: deps.page * 31 + deps.filter.length,
    checksum: deps.page * 17 + deps.filter.length,
  }),
  staleTime: 60_000,
  gcTime: 60_000,
})

export const contextRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ctx/$id',
  beforeLoad: ({ params }) => ({
    sectionSeed: Number(params.id) * 13 + 1,
  }),
})
