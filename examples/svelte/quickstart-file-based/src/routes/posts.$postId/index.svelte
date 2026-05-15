<script lang="ts">
  // No module-script here — this route has no loader of its own. The body
  // content reads from the parent `/posts/$postId` route's loader data via
  // `useLoaderData({ from })`. The parent already handles fetch / error /
  // pending, so the child just renders.
  import { Link, useLoaderData } from '@tanstack/svelte-router'

  const post = useLoaderData({ from: '/posts/$postId' })
</script>

<p class="body">{post.current.body}</p>
<p class="meta"><Link to="/posts">← back to list</Link></p>

<style>
  .body {
    line-height: 1.55;
    margin: 0 0 1.5rem;
  }
  .meta {
    color: #6b7280;
    font-size: 0.9rem;
  }
</style>
