<script lang="ts">
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error }: ErrorComponentProps = $props()
</script>

<div data-testid="error-state">{error.message}</div>
