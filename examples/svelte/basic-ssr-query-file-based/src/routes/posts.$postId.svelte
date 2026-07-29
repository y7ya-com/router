<script module lang="ts">
  import { createFileRoute, notFound } from '@tanstack/svelte-router'
  import type { QueryClient } from '@tanstack/svelte-query'
  import { postQueryOptions } from '../posts'
  import PostNotFound from '../components/PostNotFound.svelte'
  import PostError from '../components/PostError.svelte'

  export const Route = createFileRoute('/posts/$postId')({
    // SERVER: prefetch this post into the request's QueryClient. A 404 from the
    // API comes back as `null` → throw `notFound()`, which renders
    // `notFoundComponent` below inside a real 404 response.
    loader: async ({ context, params }) => {
      const post = await (
        context as { queryClient: QueryClient }
      ).queryClient.ensureQueryData(postQueryOptions(params.postId))
      if (!post) throw notFound()
      return post
    },
    // Dynamic head from loaded data — the <title> is built server-side from the
    // post that the loader fetched.
    head: ({ loaderData }) => ({
      meta: [
        {
          title: loaderData
            ? `${loaderData.title.slice(0, 48)} · Post`
            : 'Post',
        },
        {
          name: 'description',
          content: loaderData?.body?.slice(0, 140) ?? 'Post detail',
        },
      ],
    }),
    notFoundComponent: PostNotFound,
    errorComponent: PostError,
  })
</script>

<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'

  const params = Route.useParams()
  const postId = $derived(params.current?.postId ?? '')
  const postQuery = createQuery(() => postQueryOptions(postId))
</script>

<hr />
{#if postQuery.isPending}
  <p>Loading post…</p>
{:else if postQuery.data}
  <article>
    <h2>{postQuery.data.title}</h2>
    <p>{postQuery.data.body}</p>
  </article>
{/if}
