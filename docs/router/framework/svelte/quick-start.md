---
title: Quick Start (Svelte)
---

Get up and running with TanStack Router in a Svelte 5 application.

## Install

```bash
pnpm add @tanstack/svelte-router
```

Requires `svelte: ^5.0.0`.

## Define routes

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
  import About from './About.svelte'

  const rootRoute = createRootRoute({ component: RootComponent })

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
  })

  const aboutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/about',
    component: About,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, aboutRoute]),
  })

  declare module '@tanstack/svelte-router' {
    interface Register {
      router: typeof router
    }
  }
</script>

<RouterProvider {router} />
```

## Mount

```ts
// main.ts
import { mount } from 'svelte'
import App from './App.svelte'

mount(App, { target: document.getElementById('app')! })
```

## Differences from React/Solid

The API surface mirrors `@tanstack/react-router` and `@tanstack/solid-router` exactly, with a few forced adjustments for Svelte's component model:

| API | React/Solid | Svelte |
|---|---|---|
| Component slot | JSX inline | `.svelte` file or `createRawSnippet` |
| Hook return | bare value (React) / `Accessor` (Solid) | `{ current }` getter object |
| Reading in template | `data` or `data()` | `data.current` |
| `<Link to>` | Same | Same |
| `useLoaderData()` | Same call, different return | `routeApi.useLoaderData().current` |

The reactivity model uses `@tanstack/svelte-store` atoms internally — the same canonical pattern as `@tanstack/react-store` and `@tanstack/vue-store`.

## Next

- [Basic example](./examples/basic) — full working app
- [Routing Concepts](../routing/routing-concepts) — nested routes, layouts, file-based routing
