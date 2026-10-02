<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postsQueryOptions } from '~/utils/posts'

  export const Route = createFileRoute('/posts')({
    loader: async ({ context }) => {
      await context.queryClient.ensureQueryData(postsQueryOptions())
    },
    head: () => ({ meta: [{ title: 'Posts' }] }),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  const postsQuery = createQuery(() => postsQueryOptions())
  const posts = $derived([
    ...(postsQuery.data ?? []),
    { id: 'i-do-not-exist', title: 'Non-existent Post' },
  ])
</script>

<div class="p-2 flex gap-2">
  {#if postsQuery.isPending}
    <div>Loading posts...</div>
  {:else}
    <ul class="list-disc pl-4">
      {#each posts as post (post.id)}
        <li class="whitespace-nowrap">
          <Link
            to="/posts/$postId"
            params={{
              postId: post.id,
            }}
            class="block py-1 text-blue-800 hover:text-blue-600"
            activeProps={{ class: 'text-black font-bold' }}
          >
            <div>{post.title.substring(0, 20)}</div>
          </Link>
        </li>
      {/each}
    </ul>
  {/if}
  <hr />
  <Outlet />
</div>
