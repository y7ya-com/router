<script lang="ts">
  import type { RouterManagedTag } from '@tanstack/router-core'

  type Props = RouterManagedTag
  let props: Props = $props()
</script>

{#if props.tag === 'meta'}
  <meta {...props.attrs} />
{:else if props.tag === 'link'}
  <link {...props.attrs} />
{:else if props.tag === 'title'}
  <title>{props.children}</title>
{:else if props.tag === 'style'}
  <svelte:element this="style" {...props.attrs}>
    {#if props.children}{@html props.children}{/if}
  </svelte:element>
{:else if props.tag === 'script'}
  <svelte:element this="script" {...props.attrs}>
    {#if props.children}{@html props.children}{/if}
  </svelte:element>
{/if}
