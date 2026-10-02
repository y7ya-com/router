<script lang="ts">
  import { ErrorComponent } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'
  import { NotFoundError } from '../posts'

  let { error, reset, info }: ErrorComponentProps = $props()
</script>

{#if error instanceof NotFoundError}
  <div>{error.message}</div>
{:else}
  <ErrorComponent {error} {reset} {info} />
{/if}
