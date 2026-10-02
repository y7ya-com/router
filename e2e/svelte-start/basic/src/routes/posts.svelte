<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPosts } from '~/utils/posts'

  export const Route = createFileRoute('/posts')({
    head: () => ({
      meta: [
        {
          title: 'Posts page',
        },
      ],
    }),
    loader: async () => fetchPosts(),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const posts = Route.useLoaderData()
</script>

<div class="p-2 flex gap-2">
  <ul class="list-disc pl-4">
    {#each posts.current as post (post.id)}
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
  <hr />
  <Outlet />
</div>
