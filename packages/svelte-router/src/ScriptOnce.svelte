<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet | string
    log?: boolean
    sync?: boolean
  }

  let { children }: Props = $props()

  // TODO(svelte-port): SSR script-once emission. v1 client-only: render nothing.
</script>

{#if typeof children === 'string'}
  <script>{@html children}</script>
{/if}
