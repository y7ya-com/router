<script module lang="ts">
  import { createLazyFileRoute } from '@tanstack/svelte-router'

  export const Route = createLazyFileRoute('/lazyonly')({})
</script>

<div>lazy only</div>
