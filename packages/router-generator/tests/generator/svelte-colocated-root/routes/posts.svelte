<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/posts')({
    loader: ({ context }) => context.auth,
  })
</script>

<div>posts</div>
