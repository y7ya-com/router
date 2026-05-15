<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<nav class="topnav">
  <Link
    to="/"
    activeProps={{ class: 'active' }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>
  <Link to="/posts" activeProps={{ class: 'active' }}>Posts</Link>
  <Link to="/about" activeProps={{ class: 'active' }}>About</Link>
  <Link to="/does-not-exist" activeProps={{ class: 'active' }}>
    Broken Link (404)
  </Link>
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
    gap: 1rem;
    font-size: 1.05rem;
  }
  hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 0;
  }
</style>
