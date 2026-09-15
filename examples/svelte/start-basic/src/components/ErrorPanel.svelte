<script lang="ts">
  import { Link, useRouter } from '@tanstack/svelte-router'

  let { error, reset }: { error: unknown; reset?: () => void } = $props()
  const router = useRouter()
</script>

<div class="error">
  <p>{error instanceof Error ? error.message : String(error)}</p>
  <p>
    <button
      onclick={() => {
        void router.invalidate()
        reset?.()
      }}
    >
      Try Again
    </button>
    <Link to="/">Home</Link>
  </p>
</div>
