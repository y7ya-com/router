<script lang="ts">
  import Login from './Login.svelte'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error }: ErrorComponentProps = $props()
</script>

{#if error instanceof Error && error.message === 'Not authenticated'}
  <Login />
{:else}
  {(() => {
    throw error
  })()}
{/if}
