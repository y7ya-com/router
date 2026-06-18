# basic-ssr-query-file-based (Svelte)

Server-side rendering with TanStack Router **and** TanStack Query for the
experimental Svelte adapter — the "smoking gun" for `@tanstack/svelte-router-ssr-query`.

It demonstrates the full SSR + Query loop:

1. The `/posts` route loader runs **on the server** and prefetches its query
   (`queryClient.ensureQueryData`).
2. The route content renders server-side (view source: the post titles are in
   the HTML), and the query cache is **dehydrated** into the page.
3. On the client, the cache is **hydrated before** the components render, so
   `createQuery` resolves straight from cache — **zero refetch**, no flash.

## Run it

```bash
pnpm dev        # express + vite middleware → http://localhost:3000
```

Open `/posts`, then **View Source**: the `<li>` post titles are already there
(server-rendered), and the dehydrated cache is in the `$_TSR` script. Open the
Network tab and reload — there's **no client request** to the posts API.

```bash
pnpm build      # build:client + build:server
pnpm serve      # production
```

## How it's wired

- `src/router.ts` — `createRouter()` makes a fresh `QueryClient` per call
  (per-request on the server) and calls `setupRouterSsrQueryIntegration`.
- `src/entry-server.ts` — `createRequestHandler` + `renderRouterToString`;
  injects vite's dev head + the client entry.
- `src/entry-client.ts` — **awaits `hydrate(router)`** (matches + dehydrated
  query cache) before `svelteHydrate`, then hydrates the `#app` container.

> Experimental community port — not an official TanStack release.
