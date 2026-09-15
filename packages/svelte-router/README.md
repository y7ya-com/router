<div align="center">
  <picture>
    <source
      media="(prefers-color-scheme: dark)"
      srcset="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router&theme=dark"
    />
    <source
      media="(prefers-color-scheme: light)"
      srcset="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router"
    />
    <img
      src="https://tanstack.com/api/readme/router.png?title=TanStack%20Svelte%20Router"
      alt="TanStack Svelte Router"
      width="900"
    />
  </picture>
</div>

# TanStack Svelte Router

🤖 Type-safe router w/ built-in caching & URL state management for Svelte 5!

## Visit [tanstack.com/router](https://tanstack.com/router) for docs, guides, API and more!

## Installation

```bash
npm install @tanstack/svelte-router
```

## Reactivity

Hooks return a rune-backed `{ readonly current: T }` instead of Solid's
accessor or Vue's ref. Read `.current` in markup or inside `$derived` and it
stays live:

```svelte
<script lang="ts">
  import { useSearch } from '@tanstack/svelte-router'

  const search = useSearch({ from: '/posts' })
</script>

<p>Page {search.current.page}</p>
```

## File-Based Routing

Use `@tanstack/router-plugin` with `target: 'svelte'`. Route files are
`.svelte` components; route options live in a `<script module>` block as
`export const Route`:

```svelte
<!-- src/routes/posts.$postId.svelte -->
<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '../posts'

  export const Route = createFileRoute('/posts/$postId')({
    loader: ({ params }) => fetchPost(params.postId),
  })
</script>

<script lang="ts">
  const post = Route.useLoaderData()
</script>

<h1>{post.current.title}</h1>
```

A route file without a `<script module>` block is treated as a component-only
route.

## Path Params With Braces

In Svelte markup `{...}` inside an attribute string is an expression, so
prefix/suffix param paths must be passed as a JavaScript string:

```svelte
<Link to={'/files/prefix{$id}'} params={{ id: '1' }}>file</Link>
```

## Server Rendering

Svelte components cannot render `<html>` or `<body>`, so the root route takes
their attributes as options:

```ts
export const Route = createRootRoute({
  htmlAttrs: { lang: 'en' },
  bodyAttrs: { class: 'app' },
})
```

`renderRouterToStream` streams the router's dehydration payload, including
deferred loader data as it resolves. Svelte 5's server renderer has no way to
flush a shell and patch in resolved markup later, so `<Await>` renders its
fallback on the server and the resolved content on the client.
