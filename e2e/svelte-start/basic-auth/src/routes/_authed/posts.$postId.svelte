<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  import PostError from '~/components/PostError.svelte'
  import PostNotFound from '~/components/PostNotFound.svelte'
  import { fetchPost } from '~/utils/posts.js'

  export const Route = createFileRoute('/_authed/posts/$postId')({
    loader: ({ params: { postId } }) => fetchPost({ data: postId }),
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
