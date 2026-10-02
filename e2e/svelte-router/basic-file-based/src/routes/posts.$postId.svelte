<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '../posts'
  import PostErrorComponent from '../components/PostErrorComponent.svelte'
  import PostNotFoundComponent from '../components/PostNotFoundComponent.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: async ({ params: { postId } }) => fetchPost(postId),
    errorComponent: PostErrorComponent,
    notFoundComponent: PostNotFoundComponent,
  })
</script>

<script lang="ts">
  import { useLoaderData } from '@tanstack/svelte-router'

  const post = useLoaderData({ from: '/posts/$postId' })
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline" data-testid="post-title">
    {post.current?.title}
  </h4>
  <div class="text-sm">{post.current?.body}</div>
</div>
