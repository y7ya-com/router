<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { fetchStats } from '../fetch-stats.svelte'
</script>

<nav class="topnav">
  <div class="links">
    <Link to="/" activeProps={{ class: 'active' }} activeOptions={{ exact: true }}>
      Home
    </Link>
    <Link to="/posts" activeProps={{ class: 'active' }}>Posts</Link>
    <Link to="/about" activeProps={{ class: 'active' }}>About</Link>
    <Link to="/posts/9999" activeProps={{ class: 'active' }}>404 demo</Link>
  </div>
  <span class="badge" title="Real network fetches since load. Cached reads don't count.">
    network fetches: <strong>{fetchStats.count}</strong>
  </span>
</nav>
<hr />
<Outlet />

<style>
  :global(body) {
    margin: 0;
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      Segoe UI,
      sans-serif;
    color: #1f2937;
    background: #fff;
  }
  :global(a) {
    color: #2563eb;
    text-decoration: none;
  }
  :global(a:hover) {
    text-decoration: underline;
  }
  :global(a.active) {
    font-weight: 700;
    color: #111827;
  }
  .topnav {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 1.05rem;
  }
  .links {
    display: flex;
    gap: 1rem;
  }
  .badge {
    font-size: 0.85rem;
    color: #6b7280;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 999px;
    padding: 0.2rem 0.7rem;
  }
  .badge strong {
    color: #059669;
  }
  hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 0;
  }
</style>
