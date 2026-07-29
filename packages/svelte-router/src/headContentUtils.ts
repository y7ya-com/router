import { useSelector } from '@tanstack/svelte-store'
import {
  appendUniqueUserTags,
  escapeHtml,
  getAssetCrossOrigin,
  getScriptPreloadAttrs,
  resolveManifestCssLink,
} from '@tanstack/router-core'
import { useRouter } from './useRouter'
import type {
  AssetCrossOriginConfig,
  RouterManagedTag,
} from '@tanstack/router-core'

/**
 * Build the list of head/link/meta/script tags to render for active matches.
 * Used internally by `HeadContent`.
 *
 * Mirrors `@tanstack/solid-router`'s `useTags` against router-core's manifest
 * model: per-route `css` links + a single top-level `inlineStyle`, with script
 * preloads resolved via `getScriptPreloadAttrs`. User-authored tags (meta,
 * links, styles, scripts) are de-duplicated with `appendUniqueUserTags`.
 */
export function useTags(assetCrossOrigin?: AssetCrossOriginConfig): {
  readonly current: Array<RouterManagedTag>
} {
  const router = useRouter()
  const nonce = router.options.ssr?.nonce

  return useSelector(router.stores.matches, (matches: Array<any>) => {
    const routeMetasArray = matches
      .map((match) => match.meta!)
      .filter(Boolean) as Array<Array<any>>

    const meta: Array<RouterManagedTag> = []
    const metaByAttribute: Record<string, true> = {}
    let title: RouterManagedTag | undefined

    for (let i = routeMetasArray.length - 1; i >= 0; i--) {
      const metas = routeMetasArray[i]!
      for (let j = metas.length - 1; j >= 0; j--) {
        const m = metas[j]
        if (!m) continue

        if (m.title) {
          if (!title) title = { tag: 'title', children: m.title }
        } else if ('script:ld+json' in m) {
          try {
            const json = JSON.stringify(m['script:ld+json'])
            meta.push({
              tag: 'script',
              attrs: { type: 'application/ld+json' },
              children: escapeHtml(json),
            })
          } catch {
            /* skip invalid JSON-LD */
          }
        } else {
          const attribute = m.name ?? m.property
          if (attribute) {
            if (metaByAttribute[attribute]) continue
            metaByAttribute[attribute] = true
          }
          meta.push({ tag: 'meta', attrs: { ...m, nonce } })
        }
      }
    }
    if (title) meta.push(title)
    if (router.options.ssr?.nonce) {
      meta.push({
        tag: 'meta',
        attrs: { property: 'csp-nonce', content: router.options.ssr.nonce },
      })
    }
    meta.reverse()

    const links: Array<RouterManagedTag> = matches
      .map((match) => match.links!)
      .filter(Boolean)
      .flat(1)
      .map((link) => ({ tag: 'link' as const, attrs: { ...link, nonce } }))

    const manifest = router.ssr?.manifest
    const manifestCssTags: Array<RouterManagedTag> = []
    if (manifest) {
      for (const match of matches) {
        manifest.routes[match.routeId]?.css?.forEach((link) => {
          const resolvedLink = resolveManifestCssLink(link)
          manifestCssTags.push({
            tag: 'link',
            attrs: {
              rel: 'stylesheet',
              ...resolvedLink,
              crossOrigin:
                getAssetCrossOrigin(assetCrossOrigin, 'stylesheet') ??
                resolvedLink.crossOrigin,
              nonce,
            },
          })
        })
      }
      if (manifest.inlineStyle) {
        manifestCssTags.push({
          tag: 'style',
          attrs: { ...manifest.inlineStyle.attrs, nonce },
          children: manifest.inlineStyle.children,
          inlineCss: true,
        })
      }
    }

    const preloadLinks: Array<RouterManagedTag> = []
    for (const match of matches) {
      router.ssr?.manifest?.routes[match.routeId]?.preloads
        ?.filter(Boolean)
        .forEach((preload) => {
          preloadLinks.push({
            tag: 'link',
            attrs: {
              ...getScriptPreloadAttrs(
                router.ssr?.manifest,
                preload,
                assetCrossOrigin,
              ),
              nonce,
            },
          })
        })
    }

    const styles: Array<RouterManagedTag> = (
      matches
        .map((match) => match.styles!)
        .flat(1)
        .filter(Boolean)
    ).map(({ children, ...style }) => ({
      tag: 'style' as const,
      attrs: { ...style, nonce },
      children,
    }))

    const headScripts: Array<RouterManagedTag> = (
      matches
        .map((match) => match.headScripts!)
        .flat(1)
        .filter(Boolean)
    ).map(({ children, ...script }) => ({
      tag: 'script' as const,
      attrs: { ...script, nonce },
      children,
    }))

    const next: Array<RouterManagedTag> = []
    appendUniqueUserTags(next, meta)
    next.push(...preloadLinks)
    appendUniqueUserTags(next, links)
    next.push(...manifestCssTags)
    appendUniqueUserTags(next, styles)
    appendUniqueUserTags(next, headScripts)

    return next
  }) as { readonly current: Array<RouterManagedTag> }
}
