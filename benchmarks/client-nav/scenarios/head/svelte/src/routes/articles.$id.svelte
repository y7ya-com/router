<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { articleHead } from '../../../shared'

  export const Route = createFileRoute('/articles/$id')({
    head: ({ params }) => articleHead(params.id),
  })
</script>

<script lang="ts">
  import { articleDescription, articleTitle } from '../../../shared'

  const params = Route.useParams()
</script>

<article>
  <h1>{articleTitle(params.current.id)}</h1>
  <p>{articleDescription(params.current.id)}</p>
</article>
