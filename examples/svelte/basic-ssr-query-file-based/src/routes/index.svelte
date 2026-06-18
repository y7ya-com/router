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
<p>
  View source on <code>/posts</code> to see the post titles already in the HTML
  and the dehydrated cache in the <code>$_TSR</code> script.
</p>
<p><Link to="/posts">→ Posts (server-prefetched)</Link></p>
