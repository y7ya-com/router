<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute(
    '/_first/_second-layout/route-without-file/layout-a',
  )()
</script>

<div>I'm layout A!</div>
