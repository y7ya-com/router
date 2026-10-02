<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { echoGet, echoPost } from '../fns'

  export const Route = createFileRoute('/')({})
</script>

<main data-get={echoGet.url} data-post={echoPost.url}>server-fns</main>
