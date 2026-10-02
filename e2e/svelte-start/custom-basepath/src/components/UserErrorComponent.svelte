<script lang="ts">
  import { ErrorComponent } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error, reset }: ErrorComponentProps = $props()
</script>

<ErrorComponent {error} {reset} />
