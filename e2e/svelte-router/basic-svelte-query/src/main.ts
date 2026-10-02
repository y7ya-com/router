import { mount } from 'svelte'
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/svelte-router'
import { QueryClient } from '@tanstack/svelte-query'
import { postQueryOptions, postsQueryOptions } from './posts'
import App from './components/App.svelte'
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
import './styles.css'

const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: Root,
  notFoundComponent: RootNotFound,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'posts',
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQueryOptions),
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
  loader: ({ context: { queryClient }, params: { postId } }) =>
    queryClient.ensureQueryData(postQueryOptions(postId)),
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

const routeTree = rootRoute.addChildren([
  postsRoute.addChildren([postRoute, postsIndexRoute]),
  layoutRoute.addChildren([
    layout2Route.addChildren([layoutARoute, layoutBRoute]),
  ]),
  indexRoute,
])

const queryClient = new QueryClient()

// Set up a Router instance
const router = createRouter({
  routeTree,
  scrollRestoration: true,
  defaultPreload: 'intent',
  // Since we're using Svelte Query, we don't want loader calls to ever be stale
  // This will ensure that the loader is always called when the route is preloaded or visited
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
})

// Register things for typesafety
declare module '@tanstack/svelte-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  mount(App, { target: rootElement, props: { router, queryClient } })
}
