<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '../posts'
  import PostError from '../components/PostError.svelte'
  import PostNotFound from '../components/PostNotFound.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: async ({ params: { postId } }) => fetchPost(postId),
    errorComponent: PostError,
    notFoundComponent: PostNotFound,
  })
</script>

<script lang="ts">
  const post = Route.useLoaderData()
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">{post.current.title}</h4>
  <div class="text-sm">{post.current.body}</div>
</div>
