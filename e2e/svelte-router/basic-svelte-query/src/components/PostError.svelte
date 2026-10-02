<script lang="ts">
  import { ErrorComponent, useRouter } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'
  import { NotFoundError } from '../posts'

  let { error, reset, info }: ErrorComponentProps = $props()

  const router = useRouter()
</script>

{#if error instanceof NotFoundError}
  <div>{error.message}</div>
{:else}
  <div>
    <button
      onclick={() => {
        router.invalidate()
      }}
    >
      retry
    </button>
    <ErrorComponent {error} {reset} {info} />
  </div>
{/if}
