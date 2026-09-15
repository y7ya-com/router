<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  // The router passes the payload of `notFound({ data })`; unused here, but a
  // component that declares no props would reject it.
  let { data: _data }: { data?: unknown } = $props()
</script>

<div class="not-found">
  <p>The page you are looking for does not exist.</p>
  <p>
    <button onclick={() => window.history.back()}>Go back</button>
    <Link to="/">Start Over</Link>
  </p>
</div>
