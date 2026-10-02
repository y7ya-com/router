<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  let {}: { data?: unknown } = $props()
</script>

<div>
  <p>This is the notFoundComponent configured on root route</p>
  <Link to="/">Start Over</Link>
</div>
