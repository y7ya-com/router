<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { postsQueryOptions } from '../posts'
  import { queryClient } from '../query-client'

  type PostsSearch = { filter?: string }

  export const Route = createFileRoute('/posts')({
    // Typed search-param state — the filter lives in the URL.
    validateSearch: (search: Record<string, unknown>): PostsSearch => ({
      filter: typeof search.filter === 'string' ? search.filter : undefined,
    }),
    // Prefetch the list into the query cache before the component renders.
    loader: () => queryClient.ensureQueryData(postsQueryOptions()),
  })
</script>

<script lang="ts">
  import { Link, Outlet, useNavigate } from '@tanstack/svelte-router'
  import { createQuery } from '@tanstack/svelte-query'

  // `postsQueryOptions` is imported in `<script module>` above and is in scope
  // here too.
  const search = Route.useSearch()
  const navigate = useNavigate()

  // Reads the cache the loader just populated — no extra fetch.
  const postsQuery = createQuery(() => postsQueryOptions())

  const filter = $derived(search.current.filter ?? '')
  const filtered = $derived(
    (postsQuery.data ?? []).filter((p) =>
      filter ? p.title.toLowerCase().includes(filter.toLowerCase()) : true,
    ),
  )

  function setFilter(e: Event) {
    const value = (e.currentTarget as HTMLInputElement).value
    navigate({
      to: '/posts',
      search: { filter: value || undefined },
      replace: true,
    })
  }
</script>

<div class="posts-layout">
  <aside>
    <input
      type="search"
      placeholder="filter…"
      value={filter}
      oninput={setFilter}
    />

    {#if postsQuery.isPending}
      <p class="muted">Loading posts…</p>
    {:else if postsQuery.isError}
      <p class="muted">Error: {postsQuery.error.message}</p>
    {:else}
      <ul>
        {#each filtered as post (post.id)}
          <li>
            <Link
              to="/posts/$postId"
              params={{ postId: String(post.id) }}
              activeProps={{ class: 'active' }}
            >
              {post.title}
            </Link>
          </li>
        {/each}
        {#if filtered.length === 0}
          <li class="muted">No posts match "{filter}".</li>
        {/if}
      </ul>
    {/if}
  </aside>

  <main>
    <Outlet />
  </main>
</div>

<style>
  .posts-layout {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  input {
    width: 100%;
    padding: 0.45rem 0.6rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    box-sizing: border-box;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  li {
    padding: 0.4rem 0;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.95rem;
  }
  .muted {
    color: #6b7280;
    font-style: italic;
  }
  main {
    min-height: 220px;
  }
</style>
