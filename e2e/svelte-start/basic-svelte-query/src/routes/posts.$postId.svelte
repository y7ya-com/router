<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postQueryOptions } from '~/utils/posts'
  import PostErrorComponent from '~/components/PostErrorComponent.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: async ({ context, params }) => {
      await context.queryClient.ensureQueryData(postQueryOptions(params.postId))
    },
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

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">
    {postQuery.data?.title}
  </h4>
  <div class="text-sm">{postQuery.data?.body}</div>
  <Link
    to="/posts/$postId/deep"
    params={{
      postId: postQuery.data?.id ?? '',
    }}
    activeProps={{ class: 'text-black font-bold' }}
    class="inline-block py-1 text-blue-800 hover:text-blue-600"
  >
    Deep View
  </Link>
</div>
