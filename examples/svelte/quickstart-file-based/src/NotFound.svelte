<script lang="ts">
  import { Link, useRouter } from '@tanstack/svelte-router'

  const router = useRouter()
</script>

<div class="page">
  <h1>404 · Route not found</h1>
  <p>
    No route in the tree matched <code>{router.state.location.pathname}</code>.
    This component is registered on <code>createRouter</code> as
    <code>defaultNotFoundComponent</code>, which makes it the global fallback
    for every unmatched path.
  </p>
  <p>
    <Link to="/">← Home</Link>
  </p>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 640px;
    color: #4b5563;
    line-height: 1.55;
  }
  h1 {
    margin-top: 0;
    color: #111827;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: #be123c;
  }
</style>
