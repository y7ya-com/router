<script lang="ts">
  import { ErrorComponent } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error, reset, info }: ErrorComponentProps = $props()
</script>

<ErrorComponent {error} {reset} {info} />
