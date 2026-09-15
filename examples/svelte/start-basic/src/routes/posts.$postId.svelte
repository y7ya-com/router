<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '../posts'
  import NotFound from '../components/NotFound.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: ({ params: { postId } }) => fetchPost({ data: postId }),
    head: ({ loaderData }) => ({
      meta: [{ title: loaderData ? `${loaderData.title} · Post` : 'Post' }],
    }),
    notFoundComponent: NotFound,
  })
</script>

<script lang="ts">
  const post = Route.useLoaderData()
</script>

{#if post.current}
  <article>
    <h4>{post.current.title}</h4>
    <p>{post.current.body}</p>
  </article>
{/if}
