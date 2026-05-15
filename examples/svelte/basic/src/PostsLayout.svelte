<script lang="ts">
  import { Link, Outlet, getRouteApi } from '@tanstack/svelte-router'

  const postsRouteApi = getRouteApi('/posts')
  const posts = postsRouteApi.useLoaderData()
</script>

<div style="padding: .5rem; display: flex; gap: .5rem;">
  <ul style="list-style: disc; padding-left: 1rem;">
    {#each [...posts.current, { id: 'i-do-not-exist', title: 'Non-existent Post' }] as post}
      <li style="white-space: nowrap;">
        <Link
          to="/posts/$postId"
          params={{ postId: post.id }}
        >
          <div>{post.title.substring(0, 20)}</div>
        </Link>
      </li>
    {/each}
  </ul>
  <Outlet />
</div>
