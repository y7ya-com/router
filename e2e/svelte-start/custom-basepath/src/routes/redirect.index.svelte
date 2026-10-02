<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/')()
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div class="p-2 flex gap-2">
  <Link to="/redirect/throw-it">
    <div data-testid="link-to-throw-it">Throw It</div>
  </Link>
</div>
