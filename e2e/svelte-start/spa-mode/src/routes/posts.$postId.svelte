<script module lang="ts">
  import { createRawSnippet } from 'svelte'
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/posts/$postId')({
    beforeLoad: () => {
      console.log(
        `beforeLoad for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      return {
        postId: typeof window === 'undefined' ? 'server' : 'client',
      }
    },
    loader: () => {
      console.log(
        `loader for ${Route.id} called on the ${typeof window !== 'undefined' ? 'client' : 'server'}`,
      )
      return { postId: typeof window === 'undefined' ? 'server' : 'client' }
    },
    pendingComponent: createRawSnippet(() => ({
      render: () => '<div>$postId Loading...</div>',
    })),
  })
</script>

<script lang="ts">
  const loaderData = Route.useLoaderData()
  const context = Route.useRouteContext()
</script>

<div data-testid="postId-container">
  <h4 data-testid="postId-heading">postId</h4>
  <div>
    loader: <b data-testid="postId-loader">{loaderData.current.postId}</b>
  </div>
  <div>
    context: <b data-testid="postId-context">{context.current.postId}</b>
  </div>
</div>
