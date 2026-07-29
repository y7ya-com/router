<script lang="ts">
  import { getContext } from 'svelte'
  import { useTags } from './headContentUtils'
  import { headSlotContextKey } from './routerContext'

  const tagsSel = useTags()

  // Render at most once per SSR tree. The scaffolds (RouterServer/RouterClient)
  // seed a head slot; the first `HeadContent` claims it and renders, any later
  // instance becomes a no-op (prevents duplicate `<meta>` tags). In pure SPA
  // mode there's no slot, so this is always `false` and every instance renders.
  const headSlot = getContext(headSlotContextKey) as
    | { used: boolean }
    | undefined
  const suppressed =
    !!headSlot && (headSlot.used || ((headSlot.used = true), false))

  // Svelte does not evaluate `{@html}` (or any interpolation) inside a literal
  // style/script element — their content is treated as raw text. Tags carrying
  // dynamic children (manifest inlineStyle, inline scripts) are serialized to a
  // full element string and injected via `{@html}` instead.
  //
  // The closing tags below use an escaped slash (`<\/style>`) so the raw close
  // token never appears in this file's source — otherwise it would prematurely
  // terminate the component's script block. In a template literal `<\/x>` is the
  // string `</x>`, so the emitted HTML is correct.
  function attrStr(attrs: Record<string, any> = {}): string {
    let out = ''
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue
      if (value === true) {
        out += ` ${key}`
        continue
      }
      out += ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`
    }
    return out
  }

  function styleTagHtml(tag: { attrs?: Record<string, any>; children?: string }) {
    return `<style${attrStr(tag.attrs)}>${tag.children ?? ''}<\/style>`
  }

  function scriptTagHtml(tag: {
    attrs?: Record<string, any>
    children?: string
  }) {
    return `<script${attrStr(tag.attrs)}>${tag.children ?? ''}<\/script>`
  }
</script>

<!-- `<svelte:head>` must be a top-level element (can't be wrapped in a block),
     so the single-render guard lives inside it: when suppressed, it renders
     nothing. -->
<svelte:head>
  {#if !suppressed}
    <!-- The style/script branches serialize a whole element and emit it with
    `{@html}`: `<svelte:head>` can't host `<svelte:element>`, so the tag has to
    be built as a string. Contents come from route `head` options and the build
    manifest — author-controlled, never user input. -->
    {#each tagsSel.current as tag, i (i)}
      {#if tag.tag === 'title'}
        <title>{tag.children}</title>
      {:else if tag.tag === 'meta'}
        <meta {...tag.attrs} />
      {:else if tag.tag === 'link'}
        <link {...tag.attrs} />
      {:else if tag.tag === 'style'}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html styleTagHtml(tag)}
      {:else if tag.tag === 'script'}
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html scriptTagHtml(tag)}
      {/if}
    {/each}
  {/if}
</svelte:head>
