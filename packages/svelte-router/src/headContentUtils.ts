import { useSelector } from '@tanstack/svelte-store'
import {
  escapeHtml,
  getAssetCrossOrigin,
  isInlinableStylesheet,
  resolveManifestAssetLink,
} from '@tanstack/router-core'
import { useRouter } from './useRouter'
import type {
  AssetCrossOriginConfig,
  RouterManagedTag,
} from '@tanstack/router-core'

/**
 * Build the list of head/link/meta/script tags to render for active matches.
 * Used internally by `HeadContent`.
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

    const resultMeta: Array<RouterManagedTag> = []
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
            resultMeta.push({
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
          resultMeta.push({ tag: 'meta', attrs: { ...m, nonce } })
        }
      }
    }
    if (title) resultMeta.push(title)
    if (router.options.ssr?.nonce) {
      resultMeta.push({
        tag: 'meta',
        attrs: { property: 'csp-nonce', content: router.options.ssr.nonce },
      })
    }
    resultMeta.reverse()

    const links: Array<RouterManagedTag> = matches
      .map((match) => match.links!)
      .filter(Boolean)
      .flat(1)
      .map((link) => ({ tag: 'link' as const, attrs: { ...link, nonce } }))

    const manifest = router.ssr?.manifest
    const assetTags: Array<RouterManagedTag> = matches
      .map((match) => manifest?.routes[match.routeId]?.assets ?? [])
      .filter(Boolean)
      .flat(1)
      .flatMap((asset): Array<RouterManagedTag> => {
        if (asset.tag === 'link') {
          if (isInlinableStylesheet(manifest, asset)) return []
          return [
            {
              tag: 'link',
              attrs: {
                ...asset.attrs,
                crossOrigin:
                  getAssetCrossOrigin(assetCrossOrigin, 'stylesheet') ??
                  asset.attrs?.crossOrigin,
                nonce,
              },
            },
          ]
        }
        if (asset.tag === 'style') {
          return [
            {
              tag: 'style',
              attrs: { ...asset.attrs, nonce },
              children: asset.children,
              ...(asset.inlineCss ? { inlineCss: true as const } : {}),
            },
          ]
        }
        return []
      })

    const styles: Array<RouterManagedTag> = (
      matches
        .map((match) => match.styles!)
        .flat(1)
        .filter(Boolean) as Array<any>
    ).map(({ children, ...style }) => ({
      tag: 'style' as const,
      attrs: { ...style, nonce },
      children,
    }))

    const headScripts: Array<RouterManagedTag> = (
      matches
        .map((match) => match.headScripts!)
        .flat(1)
        .filter(Boolean) as Array<any>
    ).map(({ children, ...script }) => ({
      tag: 'script' as const,
      attrs: { ...script, nonce },
      children,
    }))

    const preloadLinks: Array<RouterManagedTag> = []
    for (const match of matches) {
      const route = router.looseRoutesById[match.routeId]
      if (!route) continue
      router.ssr?.manifest?.routes[route.id]?.preloads
        ?.filter(Boolean)
        .forEach((preload) => {
          const preloadLink = resolveManifestAssetLink(preload)
          preloadLinks.push({
            tag: 'link',
            attrs: {
              rel: 'modulepreload',
              href: preloadLink.href,
              crossOrigin:
                getAssetCrossOrigin(assetCrossOrigin, 'modulepreload') ??
                preloadLink.crossOrigin,
              nonce,
            },
          })
        })
    }

    return uniqBy(
      [
        ...resultMeta,
        ...preloadLinks,
        ...links,
        ...assetTags,
        ...styles,
        ...headScripts,
      ],
      (d) => JSON.stringify(d),
    )
  }) as { readonly current: Array<RouterManagedTag> }
}

export function uniqBy<T>(arr: Array<T>, fn: (item: T) => string) {
  const seen = new Set<string>()
  return arr.filter((item) => {
    const key = fn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
