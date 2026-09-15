<script lang="ts">
  import { getContext } from 'svelte'
  import { isServer } from '@tanstack/router-core/isServer'
  import { keyTags, useTags } from './headContentUtils.js'
  import { headSlotContextKey } from './routerContext.js'
  import { useRouter } from './useRouter.js'
  import { isExecutableScript } from './utils.js'
  import ClientScript from './ClientScript.svelte'
  import type {
    AssetCrossOriginConfig,
    RouterManagedTag,
  } from '@tanstack/router-core'

  let { assetCrossOrigin }: { assetCrossOrigin?: AssetCrossOriginConfig } =
    $props()

  const router = useRouter()
  // svelte-ignore state_referenced_locally
  const tagsSel = useTags(assetCrossOrigin)

  // Stylesheets rendered by the server stay in the head after their route
  // becomes inactive: the bundler skips injecting a stylesheet that is already
  // linked, so removing it would unstyle a later route sharing that chunk.
  const preservedStylesheets =
    !(isServer ?? router.isServer) && router.ssr
      ? keyTags(
          tagsSel.current.filter(
            (tag) => tag.tag === 'link' && tag.attrs?.rel === 'stylesheet',
          ),
        )
      : []

  const tags = $derived.by(() => {
    const keyed = keyTags(tagsSel.current)
    for (const preserved of preservedStylesheets) {
      if (!keyed.some((entry) => entry.key === preserved.key)) {
        keyed.push(preserved)
      }
    }
    return keyed
  })

  // Tags present when hydrating were rendered (and their scripts run) by the
  // server; later executable scripts are inserted by `ClientScript`.
  // svelte-ignore state_referenced_locally
  const ssrTagKeys = new Set(
    !(isServer ?? router.isServer) && router.ssr ? tags.map((t) => t.key) : [],
  )
  const renderInline = (key: string, tag: RouterManagedTag) =>
    (isServer ?? router.isServer) ||
    ssrTagKeys.has(key) ||
    !isExecutableScript(tag.attrs)

  // Render at most once per tree. The scaffolds (RouterServer/RouterClient)
  // seed a head slot, and `RouterProvider` seeds one when they haven't (pure
  // SPA); the first `HeadContent` claims it and renders, any later instance
  // becomes a no-op (prevents duplicate `<meta>` tags).
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
      if (value == null || value === false) {
        continue
      }
      if (value === true) {
        out += ` ${key}`
        continue
      }
      out += ` ${key}="${String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`
    }
    return out
  }

  function styleTagHtml(tag: {
    attrs?: Record<string, any>
    children?: string
  }) {
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
    {#each tags as { key, tag } (key)}
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
        {#if renderInline(key, tag)}
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          {@html scriptTagHtml(tag)}
        {:else}
          <ClientScript attrs={tag.attrs} children={tag.children} />
        {/if}
      {/if}
    {/each}
  {/if}
</svelte:head>
