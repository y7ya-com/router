<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import PostError from '../components/PostError.svelte'

  // The loader throws a real error during SSR. Instead of a blank page, the
  // route's `errorComponent` is server-rendered into the error boundary.
  export const Route = createFileRoute('/boom')({
    loader: () => {
      throw new Error('Boom — this error was thrown in the loader on the server.')
    },
    errorComponent: PostError,
  })
</script>

<p>You should never see this — the loader always throws.</p>
