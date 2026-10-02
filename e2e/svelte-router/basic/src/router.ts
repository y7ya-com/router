import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/svelte-router'
import { fetchPost, fetchPosts } from './posts'
import Root from './components/Root.svelte'
import RootNotFound from './components/RootNotFound.svelte'
import Index from './components/Index.svelte'
import PostsIndex from './components/PostsIndex.svelte'
import Post from './components/Post.svelte'
import PostError from './components/PostError.svelte'
import Layout from './components/Layout.svelte'
import Layout2 from './components/Layout2.svelte'
import LayoutA from './components/LayoutA.svelte'
import LayoutB from './components/LayoutB.svelte'
import ParamsIndex from './components/ParamsIndex.svelte'
import ParamsOutput from './components/ParamsOutput.svelte'

const rootRoute = createRootRoute({
  component: Root,
  notFoundComponent: RootNotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

export const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  loader: () => fetchPosts(),
}).lazy(() => import('./posts.lazy').then((d) => d.Route))

const postsIndexRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '/',
  component: PostsIndex,
})

const postRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: '$postId',
  errorComponent: PostError,
  loader: ({ params }) => fetchPost(params.postId),
  component: Post,
})

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_layout',
  component: Layout,
})

const layout2Route = createRoute({
  getParentRoute: () => layoutRoute,
  id: '_layout-2',
  component: Layout2,
})

const layoutARoute = createRoute({
  getParentRoute: () => layout2Route,
  path: '/layout-a',
  component: LayoutA,
})

const layoutBRoute = createRoute({
  getParentRoute: () => layout2Route,
  path: '/layout-b',
  component: LayoutB,
})

const paramsPsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/params-ps',
})

const paramsPsIndexRoute = createRoute({
  getParentRoute: () => paramsPsRoute,
  path: '/',
  component: ParamsIndex,
})

const paramsPsNamedRoute = createRoute({
  getParentRoute: () => paramsPsRoute,
  path: '/named',
})

const paramsPsNamedIndexRoute = createRoute({
  getParentRoute: () => paramsPsNamedRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/params-ps' })
  },
})

// Each params route renders the same component with a distinct heading; the
// component reads its params with `useParams({ strict: false })`.
const paramsOutput = (title: string) => ({ default: ParamsOutput, title })

const paramsPsNamedFooRoute = createRoute({
  getParentRoute: () => paramsPsNamedRoute,
  path: '/$foo',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsNamedFoo'),
})

const paramsPsNamedFooPrefixRoute = createRoute({
  getParentRoute: () => paramsPsNamedRoute,
  path: '/prefix{$foo}',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsNamedFooPrefix'),
})

const paramsPsNamedFooSuffixRoute = createRoute({
  getParentRoute: () => paramsPsNamedRoute,
  path: '/{$foo}suffix',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsNamedFooSuffix'),
})

const paramsPsWildcardRoute = createRoute({
  getParentRoute: () => paramsPsRoute,
  path: '/wildcard',
})

const paramsPsWildcardIndexRoute = createRoute({
  getParentRoute: () => paramsPsWildcardRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/params-ps' })
  },
})

const paramsPsWildcardSplatRoute = createRoute({
  getParentRoute: () => paramsPsWildcardRoute,
  path: '$',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsWildcardSplat'),
})

const paramsPsWildcardSplatPrefixRoute = createRoute({
  getParentRoute: () => paramsPsWildcardRoute,
  path: 'prefix{$}',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsWildcardSplatPrefix'),
})

const paramsPsWildcardSplatSuffixRoute = createRoute({
  getParentRoute: () => paramsPsWildcardRoute,
  path: '{$}suffix',
  component: ParamsOutput,
  staticData: paramsOutput('ParamsWildcardSplatSuffix'),
})

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute, postsIndexRoute]),
  layoutRoute.addChildren([
    layout2Route.addChildren([layoutARoute, layoutBRoute]),
  ]),
  paramsPsRoute.addChildren([
    paramsPsNamedRoute.addChildren([
      paramsPsNamedFooPrefixRoute,
      paramsPsNamedFooSuffixRoute,
      paramsPsNamedFooRoute,
      paramsPsNamedIndexRoute,
    ]),
    paramsPsWildcardRoute.addChildren([
      paramsPsWildcardSplatRoute,
      paramsPsWildcardSplatPrefixRoute,
      paramsPsWildcardSplatSuffixRoute,
      paramsPsWildcardIndexRoute,
    ]),
    paramsPsIndexRoute,
  ]),
  indexRoute,
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  scrollRestoration: true,
})

declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
  interface StaticDataRouteOption {
    title?: string
  }
}
