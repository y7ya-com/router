<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '~/utils/posts'
  import PostErrorComponent from '~/components/PostErrorComponent.svelte'
  import PostNotFound from '~/components/PostNotFound.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: async ({ params: { postId } }) => fetchPost({ data: postId }),
    errorComponent: PostErrorComponent,
    notFoundComponent: PostNotFound,
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const post = Route.useLoaderData()
</script>

<div class="space-y-2" data-testid="post-view">
  <h4 class="text-xl font-bold underline">{post.current.title}</h4>
  <div class="text-sm">{post.current.body}</div>
  <Link
    to="/posts/$postId/deep"
    params={{
      postId: post.current.id,
    }}
    activeProps={{ class: 'text-black font-bold' }}
    class="block py-1 text-blue-800 hover:text-blue-600"
  >
    Deep View
  </Link>
</div>
