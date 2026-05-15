<script lang="ts">
  import { Link, Outlet, useNavigate, useSearch } from '@tanstack/svelte-router'

  const allPosts = [
    { id: 1, title: 'Routing without a build step' },
    { id: 2, title: 'Loaders, beforeLoad, and route context' },
    { id: 3, title: 'Search-param validation' },
    { id: 4, title: 'Nested layouts with <Outlet />' },
    { id: 5, title: 'Type-safe Link components' },
    { id: 6, title: 'Lazy-loaded routes via file-based code-splitting' },
  ]

  const search = useSearch({ strict: false })
  const filter = $derived((search.current?.filter as string) ?? '')

  const filtered = $derived(
    filter
      ? allPosts.filter((p) =>
          p.title.toLowerCase().includes(filter.toLowerCase()),
        )
      : allPosts,
  )

  const navigate = useNavigate()

  function setFilter(e: Event) {
    const value = (e.currentTarget as HTMLInputElement).value
    navigate({
      to: '.',
      search: () => ({ filter: value || undefined }),
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
      <li>
        <Link
          to="/posts/$postId"
          params={{ postId: '9999' }}
          activeProps={{ class: 'active' }}
        >
          (not-found example)
        </Link>
      </li>
    </ul>
  </aside>

  <main>
    <Outlet />
  </main>
</div>

<style>
  .posts-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
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
  }
  li:last-child {
    font-style: italic;
    color: #6b7280;
  }
  main {
    min-height: 200px;
  }
</style>
