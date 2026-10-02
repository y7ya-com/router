<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { articleData } from '../../../shared'

  export const Route = createFileRoute('/blog/$slug')({
    loader: ({ params }) => articleData(params.slug),
  })
</script>

<script lang="ts">
  const article = Route.useLoaderData()
</script>

<article>{`${article.current.title} (${article.current.words} words)`}</article>
