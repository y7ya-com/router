<script lang="ts">
  import { ErrorComponent, useRouter } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'
  import { PostNotFoundError } from '../posts'

  let { error, reset, info }: ErrorComponentProps = $props()

  const router = useRouter()
</script>

{#if error instanceof PostNotFoundError}
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
