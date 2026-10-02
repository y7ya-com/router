<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute(
    '/_first/_second-layout/route-without-file/layout-b',
  )()
</script>

<div>I'm layout B!</div>
