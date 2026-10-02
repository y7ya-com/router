<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/specialChars/malformed')({})
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'
</script>

<div>
  <div>Hello "/specialChars/malformed"!</div>
  <Link
    from={Route.fullPath}
    data-testid="special-malformed-path-link"
    href="/specialChars/malformed/%E0%A4"
  >
    malformed path param
  </Link>{' '}
  <Link
    from={Route.fullPath}
    data-testid="special-malformed-search-link"
    href="/specialChars/malformed/search?searchParam=%E0%A4"
  >
    malformed search param
  </Link>{' '}
  <hr />
  <Outlet />
</div>
