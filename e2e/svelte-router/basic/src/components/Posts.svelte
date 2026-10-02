<script lang="ts">
  import { Link, Outlet, useLoaderData } from '@tanstack/svelte-router'

  const posts = useLoaderData({ from: '/posts' })
  const list = $derived([
    ...(posts.current ?? []),
    { id: 'i-do-not-exist', title: 'Non-existent Post' },
  ])
</script>

<div class="p-2 flex gap-2">
  <ul class="list-disc pl-4">
    {#each list as post (post.id)}
      <li class="whitespace-nowrap">
        <Link
          to="/posts/$postId"
          params={{ postId: post.id }}
          class="block py-1 px-2 text-blue-600 hover:opacity-75"
          activeProps={{ class: 'font-bold underline' }}
        >
          <div>{post.title.substring(0, 20)}</div>
        </Link>
      </li>
    {/each}
  </ul>
  <Outlet />
</div>
