<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPosts } from '../posts'

  export const Route = createFileRoute('/posts')({
    head: () => ({
      meta: [
        {
          title: 'Posts page',
        },
      ],
    }),
    loader: fetchPosts,
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
  import type { PostType } from '../posts'

  const posts = Route.useLoaderData()
</script>

<div class="p-2 flex gap-2" data-testid="posts-links">
  <ul class="list-disc pl-4">
    {#each [...(posts.current as Array<PostType>), { id: 'i-do-not-exist', title: 'Non-existent Post' }] as post (post.id)}
      <li class="whitespace-nowrap">
        <Link
          to="/posts/$postId"
          params={{ postId: post.id }}
          class="block py-1 text-blue-600 hover:opacity-75"
          activeProps={{ class: 'font-bold underline' }}
        >
          <div>{post.title.substring(0, 20)}</div>
        </Link>
      </li>
    {/each}
  </ul>
  <hr />
  <Outlet />
</div>
