# @tanstack/svelte-router-ssr-query

> **Experimental community port.** Not an official TanStack release. Wires
> [`@tanstack/svelte-query`](https://tanstack.com/query) into
> [`@tanstack/svelte-router`](../svelte-router), mirroring
> [`@tanstack/solid-router-ssr-query`](https://github.com/TanStack/router/tree/main/packages/solid-router-ssr-query)
> and `@tanstack/react-router-ssr-query` on top of the framework-agnostic
> `@tanstack/router-ssr-query-core`.

It does two things:

1. Dehydrates the TanStack Query cache on the server and hydrates it on the
   client (queries prefetched in route loaders arrive already-populated — no
   refetch, no flash).
2. Provides the `QueryClient` to the whole route tree, so `createQuery` /
   `createMutation` work in any route component without a manual
   `<QueryClientProvider>`.

## Usage

```ts
import { QueryClient } from '@tanstack/svelte-query'
import { createRouter } from '@tanstack/svelte-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/svelte-router-ssr-query'
import { routeTree } from './routeTree.gen'

export function makeRouter() {
  const queryClient = new QueryClient()
  const router = createRouter({ routeTree, context: { queryClient } })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}
```

Prefetch in a loader, then read with `createQuery` in the component:

```ts
// routes/posts.svelte  (<script module>)
export const Route = createFileRoute('/posts')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({ queryKey: ['posts'], queryFn: fetchPosts }),
})
```

```svelte
<!-- routes/posts.svelte -->
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const posts = createQuery(() => ({ queryKey: ['posts'], queryFn: fetchPosts }))
</script>
```

## Options

`setupRouterSsrQueryIntegration(opts)` accepts everything from
`RouterSsrQueryOptions` (`router`, `queryClient`, `dehydrateOptions`,
`hydrateOptions`, `handleRedirects`) plus:

- `wrapQueryClient?: boolean` — set to `false` to skip auto-providing the
  `QueryClient` (provide it yourself with `<QueryClientProvider>`). Default `true`.

## Status

Client-side integration (provide-the-client + loader prefetch) works today. Full
SSR dehydrate→stream→hydrate depends on the `@tanstack/svelte-router` SSR
streaming/hydration path, which is still being completed.
