<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { echoPost } from '../fns'

  export const Route = createFileRoute('/')({})
</script>

<main data-post={echoPost.url}>global-middleware</main>
