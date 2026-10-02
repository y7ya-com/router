<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import PostErrorComponent from '~/components/PostErrorComponent.svelte'
  import { fetchPost } from '~/utils/posts'

  export const Route = createFileRoute('/posts_/$postId/deep')({
    loader: async ({ params: { postId } }) => fetchPost({ data: postId }),
    errorComponent: PostErrorComponent,
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const post = Route.useLoaderData()
</script>

<div class="p-2 space-y-2">
  <Link to="/posts" class="block py-1 text-blue-800 hover:text-blue-600">
    ← All Posts
  </Link>
  <h4 class="text-xl font-bold underline">{post.current.title}</h4>
  <div class="text-sm">{post.current.body}</div>
</div>
