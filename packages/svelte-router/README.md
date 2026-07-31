# @tanstack/svelte-router

> **Experimental community port.** This package is **not** an official
> TanStack release. It's a third-party Svelte 5 adapter for
> [TanStack Router](https://tanstack.com/router), built as a literal
> translation of [`@tanstack/solid-router`](https://github.com/TanStack/router/tree/main/packages/solid-router)
> with reactivity primitives swapped from Solid's `Accessor<T>` to Svelte's
> rune-friendly `{ readonly current: T }`.
>
> When and if an official Svelte adapter ships under `@tanstack/svelte-router`,
> this port is designed to be a one-line `package.json` replacement — every
> public export, component, and hook matches the official adapter API by
> intent.

## What works

- Full adapter surface mirroring `@tanstack/solid-router`: `RouterProvider`,
  `Link`, `Outlet`, `Match`, `Matches`, `MatchRoute`, `Block`, `ClientOnly`,
  `Await`, `Scripts`, `HeadContent`, `Asset`, `ScrollRestoration`,
  `Transitioner`, plus `createRouter`, `createRoute`, `createRootRoute`,
  `getRouteApi`, `createFileRoute`, `createLazyRoute`, `createLink`,
  `notFound`, `redirect`, `isNotFound`, `isRedirect`.
- All hooks: `useRouter`, `useRouterState`, `useNavigate`, `useMatch`,
  `useMatches`, `useMatchRoute`, `useParams`, `useSearch`, `useLoaderData`,
  `useLoaderDeps`, `useRouteContext`, `useBlocker`, `useCanGoBack`,
  `useHydrated`, `useParentMatches`, `useChildMatches`, `useLocation`.
- Route classes (`Route`, `RootRoute`, `RouteApi`) all carry the same
  `useMatch` / `useSearch` / `useParams` / `useLoaderData` / `useNavigate`
  / `Link` / `notFound` surface as the Solid version.
- File-based routing via `@tanstack/router-plugin/vite` with
  `target: 'svelte'` — `.svelte` route files become route components, the
  filename is the path, and `routeTree.gen.ts` is regenerated on save.
- 623 / 638 tests from the upstream `solid-router` corpus pass after
  auto-translation by an internal Solid-to-Svelte compiler; the 15 skips
  are listed in `scripts/port-tests/.j2signore` with one-line reasons (all
  framework-behavior differences — byte-exact innerHTML compares that hit
  Svelte's anchor comments, off-by-one `@tanstack/store` notify counts
  during async navigation, one timing assertion that depends on Solid's
  deferred-memo render scheduling).

## Known limitations

The following components ship as no-op v1 stubs:

- `ScrollRestoration` — manual scroll restoration is supported by
  `router-core` but the Svelte adapter component is a placeholder.
  (`useElementScrollRestoration` is exported and functional.)
- `ScriptOnce` — SSR script-once emission is not wired through; the
  component renders nothing on the client.

SSR string rendering (`renderRouterToString`) and the basic streaming path
(`renderRouterToStream`) are functional and exercised by tests; two advanced
streaming corpus tests (bot-abort and pipeTo-rejection teardown) remain
skipped — see `scripts/port-tests/.j2signore`.

Vue-only non-analogues, intentionally absent: `Body`/`Html` (vue-start's
document components — the Svelte shell is `RouterServer`, which renders the
`#app` mount point itself) and `createRouterConfig`.

Everything else listed under "What works" is functional and exercised by
the test corpus.

## Install

```bash
pnpm add @tanstack/svelte-router
```

Requires `svelte: ^5.0.0`.

## Quick start (programmatic routes)

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

  const rootRoute = createRootRoute({ component: RootComponent })
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
  })

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
  })
</script>

<RouterProvider {router} />
```

## Quick start (file-based routes)

Add to your `vite.config.js`:

```js
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'svelte' }),
    svelte(),
  ],
})
```

Then drop `.svelte` files under `src/routes/`:

```
src/routes/
  __root.svelte
  index.svelte
  about.svelte
  posts.svelte
  posts.index.svelte
  posts.$postId.svelte
```

See `examples/svelte/quickstart-file-based/` for a working version.

## License

MIT — same as the rest of the TanStack Router monorepo.
