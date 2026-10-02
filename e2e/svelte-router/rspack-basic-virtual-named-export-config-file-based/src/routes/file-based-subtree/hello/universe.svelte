<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/classic/hello/universe')({})
</script>

<div>Hello /classic/hello/universe!</div>
