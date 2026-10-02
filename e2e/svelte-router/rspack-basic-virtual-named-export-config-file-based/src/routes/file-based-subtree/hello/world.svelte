<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/classic/hello/world')({})
</script>

<div>Hello /classic/hello/world!</div>
