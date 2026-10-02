<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/')()
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div data-testid="home-container">
  <h1 data-testid="home-heading">Home</h1>
  <div>
    <Link
      to="/posts/$postId"
      params={{ postId: '1' }}
      data-testid="link-posts-1"
    >
      Go to /posts/1
    </Link>
  </div>
</div>
