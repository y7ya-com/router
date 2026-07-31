import { describe, expectTypeOf, test } from 'vitest'
import {
  createRootRoute,
  createRoute,
  createRouter,
  linkOptions,
  useLoaderData,
  useParams,
  useSearch,
} from '../src'

const rootRoute = createRootRoute()

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
})

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  validateSearch: (): { page: number } => ({ page: 0 }),
})

const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  loader: () => ({ title: 'hello' }),
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  postsRoute.addChildren([postRoute]),
])

const router = createRouter({ routeTree })

type AppRouter = typeof router

describe('useParams', () => {
  test('infers the params for a dynamic route', () => {
    expectTypeOf(
      useParams<AppRouter, '/posts/$postId'>({ from: '/posts/$postId' })
        .current,
    ).toEqualTypeOf<{ postId: string }>()
  })

  test('a route without params yields an empty object', () => {
    expectTypeOf(
      useParams<AppRouter, '/'>({ from: '/' }).current,
    ).toEqualTypeOf<{}>()
  })

  test('strict: false widens to the union of all params', () => {
    expectTypeOf(
      useParams<AppRouter, undefined, false>({ strict: false }).current,
    ).toEqualTypeOf<{ postId?: string }>()
  })
})

describe('useSearch', () => {
  test('infers the validated search schema', () => {
    expectTypeOf(
      useSearch<AppRouter, '/posts'>({ from: '/posts' }).current,
    ).toEqualTypeOf<{ page: number }>()
  })

  test('child routes inherit the parent search schema', () => {
    expectTypeOf(
      useSearch<AppRouter, '/posts/$postId'>({ from: '/posts/$postId' })
        .current.page,
    ).toEqualTypeOf<number>()
  })
})

describe('useLoaderData', () => {
  test('infers loader data for the route', () => {
    expectTypeOf(
      useLoaderData<AppRouter, '/posts/$postId'>({ from: '/posts/$postId' })
        .current,
    ).toEqualTypeOf<{ title: string }>()
  })
})

describe('linkOptions', () => {
  test('accepts a valid destination and preserves the literal', () => {
    const opts = linkOptions<{ to: '/' }, AppRouter>({ to: '/' })
    expectTypeOf(opts).toEqualTypeOf<{ to: '/' }>()
  })

  test('requires the search schema of the destination', () => {
    // @ts-expect-error search.page is required for /posts
    linkOptions<{ to: '/posts' }, AppRouter>({ to: '/posts' })

    linkOptions<
      { to: '/posts'; search: { page: number } },
      AppRouter
    >({ to: '/posts', search: { page: 1 } })
  })

  test('requires params for a dynamic destination', () => {
    linkOptions<
      {
        to: '/posts/$postId'
        params: { postId: string }
        search: { page: number }
      },
      AppRouter
    >({
      to: '/posts/$postId',
      params: { postId: 'a' },
      search: { page: 1 },
    })
  })

  test('rejects an unknown destination', () => {
    // @ts-expect-error '/nope' is not a route
    linkOptions<{ to: '/nope' }, AppRouter>({ to: '/nope' })
  })
})
