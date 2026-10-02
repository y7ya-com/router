<script lang="ts">
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error }: ErrorComponentProps = $props()
</script>

<div data-testid="deferred-error-boundary">
  {error instanceof Error ? error.message : String(error)}
</div>
