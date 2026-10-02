<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="p-8">
  <h1 class="font-bold text-lg">Server routes E2E tests</h1>
  <ul class="list-disc p-4">
    <li>
      <Link to="/merge-middleware-context">
        server route middleware context is merged correctly
      </Link>
    </li>
    <li>
      <Link to="/methods">server route methods</Link>
    </li>
  </ul>
</div>
