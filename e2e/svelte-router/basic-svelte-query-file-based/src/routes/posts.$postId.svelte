<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postQueryOptions } from '../postQueryOptions'
  import PostErrorComponent from '../components/PostErrorComponent.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    loader: ({ context: { queryClient }, params: { postId } }) => {
      return queryClient.ensureQueryData(postQueryOptions(postId))
    },
    errorComponent: PostErrorComponent,
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const params = Route.useParams()
  createQuery(() => postQueryOptions(params.current?.postId ?? ''))
  const post = Route.useLoaderData()
</script>

<div class="space-y-2">
  <h4 class="text-xl font-bold underline">{post.current?.title}</h4>
  <div class="text-sm">{post.current?.body}</div>
</div>
