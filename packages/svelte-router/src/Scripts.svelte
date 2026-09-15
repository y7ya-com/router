<script lang="ts">
  import {
    composeSsrBodyScripts,
    getSsrBodyScriptParts,
  } from '@tanstack/router-core'
  import { isServer } from '@tanstack/router-core/isServer'
  import { useSelector } from '@tanstack/svelte-store'
  import { useRouter } from './useRouter.js'
  import { keyTags } from './headContentUtils.js'
  import { isExecutableScript } from './utils.js'
  import ClientScript from './ClientScript.svelte'
  import type { AnyRouter, RouterManagedTag } from '@tanstack/router-core'

  // During streaming SSR, `<Scripts>` marks where late hydration scripts may
  // begin to be inserted: its last tag is the transport boundary.
  const router = useRouter<AnyRouter>()
  const nonce = router.options.ssr?.nonce

  function escapeAttr(value: unknown) {
    return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;')
  }

  // Tags are serialized whole rather than rendered through `<Asset>`: Svelte
  // places hydration markers inside block content, and the stream transform
  // matches the boundary script's closing bytes exactly. A literal script
  // element cannot appear in a Svelte template, hence the interpolated name.
  function toHtml(tags: Array<RouterManagedTag>) {
    return tags
      .map((tag) => {
        const attrs = Object.entries(tag.attrs ?? {})
          .filter(([, v]) => v !== undefined && v !== null && v !== false)
          .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`))
          .join('')
        return `<${'script'}${attrs}>${tag.children ?? ''}</${'script'}>`
      })
      .join('')
  }

  function getTags(matches: Array<any>) {
    return composeSsrBodyScripts(
      getSsrBodyScriptParts(matches, router.ssr?.manifest, nonce),
    )
  }

  // The server renders once and reads the stores directly; reactivity is only
  // set up in the browser. Its initial hydration scripts (the transport
  // bootstrap, then the stream boundary last) surround the route and manifest
  // scripts, the same order as `composeSsrBodyScripts`. They exist only in the
  // server render: the client takes the empty branch of their `{#if}` blocks.
  const initialHydrationTags =
    (isServer ?? router.isServer)
      ? router.serverSsr?.takeInitialHydrationScriptTags()
      : undefined
  const bootstrapHtml = initialHydrationTags
    ? toHtml(initialHydrationTags.before)
    : ''
  const boundaryHtml = initialHydrationTags
    ? toHtml([initialHydrationTags.boundary])
    : ''

  // Tags rendered by the server (on the client: hydrated, already executed)
  // are claimed as they are. Tags added by later navigations are inserted by
  // `ClientScript`, since scripts injected as HTML never run.
  const ssrTags =
    (isServer ?? router.isServer) || router.ssr
      ? keyTags(getTags(router.stores.matches.get()))
      : []
  const ssrHtml = toHtml(ssrTags.map((entry) => entry.tag))
  const ssrTagKeys = new Set(ssrTags.map((entry) => entry.key))

  const matchesSel =
    (isServer ?? router.isServer)
      ? undefined
      : useSelector(router.stores.matches)
  const clientTags = $derived(
    matchesSel
      ? keyTags(getTags(matchesSel.current)).filter(
          (entry) => !ssrTagKeys.has(entry.key),
        )
      : [],
  )
</script>

<!-- Router-generated script tags; they must reach the document as executable
elements, so they are not escaped. -->
{#if bootstrapHtml}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html bootstrapHtml}
{/if}
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html ssrHtml}
{#if boundaryHtml}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html boundaryHtml}
{/if}
{#each clientTags as { key, tag } (key)}
  {#if isExecutableScript(tag.attrs)}
    <ClientScript attrs={tag.attrs} children={tag.children} />
  {:else}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html toHtml([tag])}
  {/if}
{/each}
