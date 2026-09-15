<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPosts } from '../posts'

  export const Route = createFileRoute('/posts')({
    // Runs on the server during SSR and on the client on navigation; either
    // way `fetchPosts` executes on the server.
    loader: () => fetchPosts(),
    head: () => ({ meta: [{ title: 'Posts · TanStack Start · Svelte' }] }),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const loaderData = Route.useLoaderData()
  const posts = $derived([
    ...(loaderData.current ?? []),
    { id: 'i-do-not-exist', title: 'Non-existent Post' },
  ])
</script>

<div class="posts">
  <ul>
    {#each posts as post (post.id)}
      <li>
        <Link
          to="/posts/$postId"
          params={{ postId: String(post.id) }}
          activeProps={{ class: 'active' }}
        >
          {post.title.substring(0, 20)}
        </Link>
      </li>
    {/each}
  </ul>
  <div class="detail">
    <Outlet />
  </div>
</div>

<style>
  .posts {
    display: flex;
    gap: 1rem;
  }
  ul {
    margin: 0;
    padding-left: 1rem;
  }
  li {
    white-space: nowrap;
    padding: 0.25rem 0;
  }
</style>
