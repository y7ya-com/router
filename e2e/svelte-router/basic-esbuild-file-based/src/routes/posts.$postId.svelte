<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import PostErrorComponent from '../components/PostErrorComponent.svelte'
  import PostNotFoundComponent from '../components/PostNotFoundComponent.svelte'
  import { fetchPost } from '../posts'

  export const Route = createFileRoute('/posts/$postId')({
    loader: async ({ params: { postId } }) => fetchPost(postId),
    errorComponent: PostErrorComponent,
    notFoundComponent: PostNotFoundComponent,
  })
</script>

<script lang="ts">
  import type { PostType } from '../posts'

  const post = Route.useLoaderData()
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline" data-testid="post-title">
    {(post.current as PostType).title}
  </h4>
  <div class="text-sm">{(post.current as PostType).body}</div>
</div>
