<script module lang="ts">
  // Module-script colocates the route definition with the component below.
  // `<script module>` runs at module-load time and its exports become real ES
  // module exports of the compiled `.svelte` file — the generator imports
  // `Route` from here when wiring the route tree, the same way React/Solid
  // adapters import from `.tsx` files.
  import { createFileRoute } from '@tanstack/svelte-router'
  import { fetchPost } from '../posts'

  export const Route = createFileRoute('/posts/$postId')({
    loader: ({ params }) => fetchPost(params.postId),
    errorComponent: ({ error }) =>
      `Failed to load post: ${error.message}`,
    pendingComponent: () => 'Loading post…',
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const post = Route.useLoaderData()
  const params = Route.useParams()
</script>

<article>
  <header>
    <h1>{post.current.title}</h1>
    <p class="byline">Post #{params.current.postId}</p>
    <nav class="tabs">
      <Link
        to="/posts/$postId"
        params={{ postId: params.current.postId }}
        activeProps={{ class: 'active' }}
        activeOptions={{ exact: true }}
      >
        Body
      </Link>
      <Link
        to="/posts/$postId/comments"
        params={{ postId: params.current.postId }}
        activeProps={{ class: 'active' }}
      >
        Comments
      </Link>
    </nav>
  </header>

  <Outlet />
</article>

<style>
  article {
    max-width: 640px;
  }
  header h1 {
    margin: 0 0 0.25rem;
    font-size: 1.4rem;
  }
  .byline {
    margin: 0 0 1rem;
    color: #6b7280;
    font-size: 0.85rem;
  }
  .tabs {
    display: flex;
    gap: 1rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
    font-size: 0.95rem;
  }
  :global(.tabs a.active) {
    color: #111827;
    font-weight: 700;
  }
</style>
