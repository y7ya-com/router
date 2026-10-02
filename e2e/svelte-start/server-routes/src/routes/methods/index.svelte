<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/methods/')()
</script>

<script lang="ts">
  // Route.Link exists at runtime but is missing from the route types
  const RouteLink = (Route as any).Link
</script>

<div class="p-8">
  <ul class="list-disc p-4">
    <li>
      <RouteLink to="./only-any">Server Route only has ANY handler</RouteLink>
    </li>
  </ul>
</div>
