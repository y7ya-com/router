<script module lang="ts">
  import { createRawSnippet } from 'svelte'
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/posts')({
    beforeLoad: () => {
      console.log(
        `beforeLoad for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      return {
        posts: typeof window === 'undefined' ? 'server' : 'client',
      }
    },
    loader: () => {
      console.log(
        `loader for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )

      return { posts: typeof window === 'undefined' ? 'server' : 'client' }
    },
    pendingComponent: createRawSnippet(() => ({
      render: () => '<div>posts Loading...</div>',
    })),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const loaderData = Route.useLoaderData()
  const context = Route.useRouteContext()
</script>

<div data-testid="posts-container">
  <h3 data-testid="posts-heading">posts</h3>
  <div>
    loader: <b data-testid="posts-loader">{loaderData.current.posts}</b>
  </div>
  <div>
    context: <b data-testid="posts-context">{context.current.posts}</b>
  </div>
  <hr />
  <Outlet />
</div>
