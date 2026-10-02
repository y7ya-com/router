<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import type { Snippet } from 'svelte'

  let { children }: { children?: Snippet; data?: unknown } = $props()
</script>

<div class="space-y-2 p-2">
  <div>
    {#if children}
      {@render children()}
    {:else}
      The page you are looking for does not exist.
    {/if}
  </div>
  <p class="flex items-center gap-2 flex-wrap">
    <button
      onclick={() => window.history.back()}
      class="bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm"
    >
      Go back
    </button>
    <Link
      to="/"
      class="bg-cyan-600 text-white px-2 py-1 rounded-sm uppercase font-black text-sm"
    >
      Start Over
    </Link>
  </p>
</div>
