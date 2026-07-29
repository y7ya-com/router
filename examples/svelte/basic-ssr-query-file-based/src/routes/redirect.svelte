<script module lang="ts">
  import { createFileRoute, redirect } from '@tanstack/svelte-router'

  // The loader throws `redirect()` during SSR. The request handler turns that
  // into a real HTTP redirect response (verify: `curl -i /redirect` → 3xx +
  // Location: /posts). The component below never renders.
  export const Route = createFileRoute('/redirect')({
    loader: () => {
      throw redirect({ to: '/posts' })
    },
  })
</script>

<p>Redirecting…</p>
