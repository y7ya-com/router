<script lang="ts">
  import type { RouterManagedTag } from '@tanstack/router-core'

  type Props = RouterManagedTag
  let props: Props = $props()

  // The `style`/`script` branches below emit `props.children` with `{@html}`
  // (and disable `svelte/no-at-html-tags` inline). That is deliberate: the
  // body of an inline stylesheet or script has to reach the document verbatim
  // — escaping it would emit HTML entities instead of CSS/JS. These tags come
  // from the route's own `head`/`scripts` options and the build manifest, so
  // the content is author-controlled, never user input.
</script>

{#if props.tag === 'meta'}
  <meta {...props.attrs} />
{:else if props.tag === 'link'}
  <link {...props.attrs} />
{:else if props.tag === 'title'}
  <title>{props.children}</title>
{:else if props.tag === 'style'}
  <svelte:element this={'style'} {...props.attrs}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {#if props.children}{@html props.children}{/if}
  </svelte:element>
{:else if props.tag === 'script'}
  <svelte:element this={'script'} {...props.attrs}>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {#if props.children}{@html props.children}{/if}
  </svelte:element>
{/if}
