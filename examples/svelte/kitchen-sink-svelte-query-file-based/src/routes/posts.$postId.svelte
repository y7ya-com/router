<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postQueryOptions } from '../posts'
  import { queryClient } from '../query-client'

  export const Route = createFileRoute('/posts/$postId')({
    // Prefetch this post into the query cache, so `createQuery` below resolves
    // straight from cache on navigation. A non-existent id throws `notFound()`.
    loader: ({ params }) =>
      queryClient.ensureQueryData(postQueryOptions(params.postId)),
  })
</script>

<script lang="ts">
  import { createMutation, createQuery } from '@tanstack/svelte-query'

  // `postQueryOptions` and `queryClient` are imported in `<script module>`
  // above and are in scope here too.
  const params = Route.useParams()

  // `params.current` is briefly `undefined` while this route unmounts (Svelte
  // re-runs deriveds during the flush before teardown), so read it defensively.
  const postId = $derived(params.current?.postId ?? '')

  // Reads the same cache the loader populated — no refetch on navigation.
  const postQuery = createQuery(() => postQueryOptions(postId))

  // Mutation → invalidate → the post query refetches (network counter ticks up).
  const like = createMutation(() => ({
    mutationFn: async () => {
      await new Promise((r) => setTimeout(r, 300))
      return true
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['posts', postId] }),
  }))
</script>

{#if postQuery.isPending}
  <p>Loading post…</p>
{:else if postQuery.isError}
  <p class="err">Error: {postQuery.error.message}</p>
{:else if postQuery.data}
  <article>
    <h1>{postQuery.data.title}</h1>
    <p class="byline">Post #{postId}</p>
    <p>{postQuery.data.body}</p>
    <button onclick={() => like.mutate()} disabled={like.isPending}>
      {like.isPending ? 'Liking…' : '♥ Like (invalidate + refetch)'}
    </button>
  </article>
{/if}

<style>
  article {
    max-width: 640px;
  }
  h1 {
    margin: 0 0 0.25rem;
    font-size: 1.4rem;
  }
  .byline {
    margin: 0 0 1rem;
    color: #6b7280;
    font-size: 0.85rem;
  }
  .err {
    color: #b91c1c;
  }
  button {
    margin-top: 1rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #f9fafb;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:disabled {
    opacity: 0.6;
    cursor: default;
  }
</style>
