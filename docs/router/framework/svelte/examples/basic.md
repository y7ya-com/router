---
title: Basic Example
---

A minimal Svelte 5 application using `@tanstack/svelte-router`. Demonstrates the core surface:

- `createRouter`, `createRootRoute`, `createRoute`, `RouterProvider`
- `Link` and `Outlet` components
- Route loaders via `loader: () => ...`
- Reading loader data via `getRouteApi(...).useLoaderData()`
- Not-found handling via `notFoundComponent`

## Source

The example lives at [`examples/svelte/basic`](https://github.com/TanStack/router/tree/main/examples/svelte/basic). Clone the repository, then:

```bash
cd examples/svelte/basic
pnpm install
pnpm dev
```

## Highlights

```svelte
<!-- App.svelte -->
<script lang="ts">
  import {
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
  } from '@tanstack/svelte-router'
  import RootComponent from './RootComponent.svelte'
  import Home from './Home.svelte'
  // ...

  const rootRoute = createRootRoute({ component: RootComponent })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    defaultPreload: 'intent',
  })
</script>

<RouterProvider {router} />
```

### Route components

Unlike React/Solid which accept JSX inline, Svelte components live in their own `.svelte` files and are imported:

```svelte
<!-- RootComponent.svelte -->
<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div>
  <Link to="/" activeOptions={{ exact: true }}>Home</Link>
  <Link to="/posts">Posts</Link>
</div>

<Outlet />
```

### Loading data with `getRouteApi`

Use `getRouteApi(routeId)` to access route-scoped hooks like `useLoaderData` from any component:

```svelte
<!-- Post.svelte -->
<script lang="ts">
  import { getRouteApi } from '@tanstack/svelte-router'
  const postRouteApi = getRouteApi('/posts/$postId')
  const post = postRouteApi.useLoaderData()
</script>

<h4>{post.current.title}</h4>
<div>{post.current.body}</div>
```

In Svelte the hook returns `{ current: T }` rather than React's bare value or Solid's accessor — read via `.current`.

## Next steps

- Read [Routing Concepts](../routing/routing-concepts) for nested layouts and pathless routes
- Read [Data Loading](../guide/data-loading) for loaders, dependencies, and stale-time
- Read [Navigation](../guide/navigation) for `useNavigate`, `Link`, and programmatic redirects
