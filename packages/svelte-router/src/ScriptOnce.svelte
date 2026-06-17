<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet | string
    log?: boolean
    sync?: boolean
  }

  let { children }: Props = $props()

  // v1 renders nothing — SSR script-once emission isn't wired through yet. An
  // inline script element in the template confused both the Svelte compiler and
  // vite's dependency scanner, so it's omitted until the real SSR work lands.
  // `children` is referenced here only to satisfy no-unused-vars.
  void children
</script>
