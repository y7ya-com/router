<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/specialChars/대한민국')({})
</script>

<div class="p-2">
  Test
  <h3 data-testid="special-non-latin-heading">Hello /specialChars/대한민국</h3>
  <p>This is a route with a non-ASCII path.</p>
</div>
