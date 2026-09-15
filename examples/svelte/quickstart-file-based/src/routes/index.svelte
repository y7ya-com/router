<script lang="ts">
  import { Link, useRouterState } from '@tanstack/svelte-router'

  // Read live router state — re-renders on every navigation.
  const state = useRouterState()
</script>

<div class="page">
  <h1>Home</h1>
  <p>Last resolved location:</p>
  <pre>{state.current.location.pathname}{state.current.location.searchStr}</pre>

  <p>Routes in the tree:</p>
  <ul>
    {#each ['/', '/about', '/posts', '/posts/$postId'] as path}
      <li><code>{path}</code></li>
    {/each}
  </ul>

  <p><Link to="/posts">→ Posts</Link></p>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 640px;
    line-height: 1.55;
  }
  pre {
    background: #f3f4f6;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
  }
  code {
    background: #f3f4f6;
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-size: 0.9em;
  }
</style>
