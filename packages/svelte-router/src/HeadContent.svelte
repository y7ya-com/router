<script lang="ts">
  import { useTags } from './headContentUtils'

  const tagsSel = useTags()

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

<svelte:head>
  {#each tagsSel.current as tag}
    {#if tag.tag === 'title'}
      <title>{tag.children}</title>
    {:else if tag.tag === 'meta'}
      <meta {...tag.attrs} />
    {:else if tag.tag === 'link'}
      <link {...tag.attrs} />
    {:else if tag.tag === 'style'}
      {@html styleTagHtml(tag)}
    {:else if tag.tag === 'script'}
      {@html scriptTagHtml(tag)}
    {/if}
  {/each}
</svelte:head>
