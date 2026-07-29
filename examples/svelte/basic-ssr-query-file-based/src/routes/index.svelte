<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  // Static per-route head — server-rendered into <head>. View source: the
  // <title> below is in the raw HTML before any JS runs.
  export const Route = createFileRoute('/')({
    head: () => ({
      meta: [
        { title: 'Home · SSR + Query · Svelte' },
        {
          name: 'description',
          content:
            'Experimental Svelte adapter for TanStack Router — SSR + TanStack Query demo.',
        },
      ],
    }),
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<h1>SSR + TanStack Query · Svelte</h1>
<p>
  This page is server-rendered. The <strong>Posts</strong> page prefetches its
  query <em>on the server</em> (in the route loader), dehydrates the query cache
  into the HTML, and hydrates it on the client — so <code>createQuery</code>
  resolves instantly with no client refetch.
</p>
<p>This demo exercises the SSR surface end-to-end:</p>
<ul>
  <li>
    <strong>Server render + Query</strong> — <Link to="/posts">/posts</Link>
    (cache dehydrated, zero client refetch)
  </li>
  <li><strong>Dynamic param + nested SSR</strong> — open a post from the list</li>
  <li>
    <strong>Per-route head/meta</strong> — every page sets its own
    <code>&lt;title&gt;</code>/<code>&lt;meta&gt;</code> server-side
  </li>
  <li>
    <strong>Thrown <code>notFound()</code> + 404</strong> — visit
    <code>/posts/999999</code>
  </li>
  <li>
    <strong>Server-side redirect</strong> — <Link to="/redirect">/redirect</Link>
    → /posts
  </li>
  <li><strong>Error boundary SSR</strong> — <Link to="/boom">/boom</Link></li>
</ul>
