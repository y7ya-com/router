<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect-test-ssr/target')()
</script>

<div>
  <h1 data-testid="redirect-target-ssr">Redirect Target SSR</h1>
  <p>Successfully redirected!</p>
</div>
