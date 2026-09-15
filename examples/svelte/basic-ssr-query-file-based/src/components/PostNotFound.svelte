<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<!--
  Rendered when the `/posts/$postId` loader throws `notFound()` for an id the API
  returns 404 for. The router sets a 404 status code, so this is server-rendered
  *inside* a real 404 response (verify: `curl -i /posts/999999`).
-->
<div class="not-found">
  <h2>Post not found</h2>
  <p>That post doesn't exist (the API returned a 404).</p>
  <p><Link to="/posts">← Back to all posts</Link></p>
</div>

<style>
  .not-found {
    padding: 0.75rem 1rem;
    border: 1px solid #fcd34d;
    background: #fffbeb;
    border-radius: 6px;
  }
</style>
