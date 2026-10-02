<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/posts/')({})
</script>

<div data-testid="PostsIndexComponent">Select a post.</div>
