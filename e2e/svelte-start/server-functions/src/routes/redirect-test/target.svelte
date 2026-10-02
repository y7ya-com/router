<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect-test/target')()
</script>

<div>
  <h1 data-testid="redirect-target">Redirect Target</h1>
  <p>Successfully redirected!</p>
</div>
