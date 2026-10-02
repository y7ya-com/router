<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/search-params/')({})
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div>
  <Link
    data-testid="link-to-default-without-search"
    to="/search-params/default"
  >
    go to /search-params/default
  </Link>
  <br />
  <Link
    data-testid="link-to-default-with-search"
    to="/search-params/default"
    search={{ default: 'd2' }}
  >
    go to /search-params/default?default=d2
  </Link>
</div>
