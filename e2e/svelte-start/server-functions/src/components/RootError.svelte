<script lang="ts">
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error }: ErrorComponentProps = $props()
</script>

<p>
  {error instanceof Error ? error.stack : String(error)}
</p>
