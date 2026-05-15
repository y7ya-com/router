<script lang="ts">
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet
    fallback?: Snippet
  }

  let { children, fallback }: Props = $props()

  let hydrated = $state(false)
  onMount(() => {
    hydrated = true
  })
</script>

{#if hydrated}
  {#if children}{@render children()}{/if}
{:else if fallback}
  {@render fallback()}
{/if}
