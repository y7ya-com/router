<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import type { QueryClient } from '@tanstack/svelte-query'
  import { postsQueryOptions } from '../posts'

  export const Route = createFileRoute('/posts')({
    // Runs on the SERVER during render: prefetches the query into this request's
    // QueryClient. The integration dehydrates that cache into the HTML.
    // (cast because the Svelte route-generator doesn't yet thread the root
    // context type to loaders — runtime is fine.)
    loader: ({ context }) =>
      (context as { queryClient: QueryClient }).queryClient.ensureQueryData(
        postsQueryOptions(),
      ),
    head: () => ({
      meta: [
        { title: 'Posts · SSR + Query · Svelte' },
        { name: 'description', content: 'Server-prefetched list of posts.' },
      ],
    }),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  // `postsQueryOptions` is in scope from `<script module>` above. On the client
  // this resolves straight from the hydrated cache — no refetch.
  const postsQuery = createQuery(() => postsQueryOptions())
</script>

<h1>Posts</h1>
{#if postsQuery.isPending}
  <p>Loading…</p>
{:else if postsQuery.isError}
  <p>Error: {postsQuery.error.message}</p>
{:else if postsQuery.data}
  <ul>
    {#each postsQuery.data as post (post.id)}
      <li>
        <Link to="/posts/$postId" params={{ postId: String(post.id) }}>
          {post.title}
        </Link>
      </li>
    {/each}
  </ul>
{/if}

<!--
  This route is a layout for `/posts/$postId`: the list stays visible and the
  selected post renders below via <Outlet />. Both parent and child are
  server-rendered when you deep-link to `/posts/1`.
-->
<Outlet />
