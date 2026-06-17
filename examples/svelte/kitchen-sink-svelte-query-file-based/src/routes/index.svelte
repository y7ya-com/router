<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="page">
  <h1>TanStack Router + Query · Svelte</h1>
  <p>
    A file-based router demo wired to <strong>TanStack Query</strong> via
    <code>@tanstack/svelte-router-ssr-query</code>. What it shows:
  </p>
  <ul>
    <li>📁 <strong>File-based routing</strong> — routes generated from <code>src/routes</code>.</li>
    <li>🧭 <strong>Nested layouts</strong> with <code>&lt;Outlet /&gt;</code> and type-safe <code>&lt;Link&gt;</code>.</li>
    <li>⚡ <strong>Loader + Query prefetch</strong> — loaders call <code>ensureQueryData</code>; components read the cache with <code>createQuery</code>, so there's no refetch.</li>
    <li>🪝 <strong>Shared cache</strong> — navigate away and back; the <em>network fetches</em> counter doesn't move, because the loader and <code>createQuery</code> share one cache.</li>
    <li>🔎 <strong>Search-param state</strong> — the Posts filter lives in the URL.</li>
    <li>✍️ <strong>Mutations</strong> — "like" a post and the query cache invalidates.</li>
    <li>🚧 <strong>Errors & not-found</strong> — <code>/posts/9999</code> throws <code>notFound()</code> from a loader.</li>
  </ul>
  <p><Link to="/posts">→ Open Posts</Link></p>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 680px;
    line-height: 1.6;
  }
  h1 {
    margin-top: 0;
    font-size: 1.5rem;
  }
  li {
    margin: 0.3rem 0;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>
