<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { churnGet, churnPost } from '../fns'

  export const Route = createFileRoute('/')({})
</script>

<main
  data-bench="server-fn-churn-index"
  data-get={churnGet.url}
  data-post={churnPost.url}
>
  memory-server-fn-churn-index
</main>
