<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postQueryOptions } from '../utils/posts'
  import PostErrorComponent from '../components/PostErrorComponent.svelte'

  export const Route = createFileRoute('/posts_/$postId/deep')({
    loader: async ({ params: { postId }, context }) => {
      const data = await context.queryClient.ensureQueryData(
        postQueryOptions(postId),
      )

      return {
        title: data.title,
      }
    },
    head: ({ loaderData }) => ({
      meta: loaderData ? [{ title: loaderData.title }] : undefined,
    }),
    errorComponent: PostErrorComponent,
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  const params = Route.useParams()
  const postQuery = createQuery(() =>
    postQueryOptions(params.current?.postId ?? ''),
  )
</script>

<div class="p-2 space-y-2">
  <Link to="/posts" class="block py-1 text-blue-800 hover:text-blue-600">
    ← All Posts
  </Link>
  <h4 class="text-xl font-bold underline">
    {postQuery.data?.title}
  </h4>
  <div class="text-sm">{postQuery.data?.body}</div>
</div>
