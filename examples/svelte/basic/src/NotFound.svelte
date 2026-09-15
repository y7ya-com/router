<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  // The payload of `notFound({ data })`, when one was thrown.
  let { data: _data }: { data?: unknown } = $props()
</script>

<div>
  <p>This is the notFoundComponent configured on root route</p>
  <Link to="/">Start Over</Link>
</div>
