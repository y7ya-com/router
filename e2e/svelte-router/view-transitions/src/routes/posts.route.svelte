<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPosts } from '../posts'

  export const Route = createFileRoute('/posts')({
    loader: fetchPosts,
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const posts = Route.useLoaderData()
</script>

<div class="p-2 flex gap-2 [view-transition-name:main-content]">
  <ul class="list-disc pl-4">
    {#each [...posts.current, { id: 'i-do-not-exist', title: 'Non-existent Post' }] as post}
      <li class="whitespace-nowrap">
        <!-- see styles.css for 'warp' transition -->
        <Link
          to="/posts/$postId"
          params={{
            postId: post.id,
          }}
          class="block py-1 text-blue-600 hover:opacity-75"
          activeProps={{ class: 'font-bold underline' }}
          viewTransition={{ types: ['warp'] }}
        >
          <div>{post.title.substring(0, 20)}</div>
        </Link>
      </li>
    {/each}
  </ul>
  <hr />
  <div class="[view-transition-name:post]">
    <Outlet />
  </div>
</div>
