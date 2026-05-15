<script lang="ts">
  import {
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
  } from '@tanstack/svelte-router'
  import RootComponent from './RootComponent.svelte'
  import Home from './Home.svelte'
  import PostsLayout from './PostsLayout.svelte'
  import Post from './Post.svelte'
  import PostsIndex from './PostsIndex.svelte'
  import NotFound from './NotFound.svelte'
  import { fetchPost, fetchPosts } from './posts'

  const rootRoute = createRootRoute({
    component: RootComponent,
    notFoundComponent: NotFound,
  })

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
  })

  const postsLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: 'posts',
    loader: () => fetchPosts(),
    component: PostsLayout,
  })

  const postsIndexRoute = createRoute({
    getParentRoute: () => postsLayoutRoute,
    path: '/',
    component: PostsIndex,
  })

  const postRoute = createRoute({
    getParentRoute: () => postsLayoutRoute,
    path: '$postId',
    loader: ({ params }) => fetchPost(params.postId),
    component: Post,
  })

  const routeTree = rootRoute.addChildren([
    postsLayoutRoute.addChildren([postRoute, postsIndexRoute]),
    indexRoute,
  ])

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultStaleTime: 5000,
  })

  declare module '@tanstack/svelte-router' {
    interface Register {
      router: typeof router
    }
  }
</script>

<RouterProvider {router} />
