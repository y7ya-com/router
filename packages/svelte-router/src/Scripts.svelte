<script lang="ts">
  import { useRouter } from './useRouter'
  import { useSelector } from '@tanstack/svelte-store'
    import type { RouterManagedTag } from '@tanstack/router-core'

  const router = useRouter()
  const nonce = router.options.ssr?.nonce
  const matchesSel = useSelector(router.stores.matches, (s) => s)

  const allScripts = $derived.by(() => {
    const matches = matchesSel.current

    const scripts: Array<RouterManagedTag> = []
    for (const match of matches) {
      const matchScripts = (match as any).scripts as
        | Array<any>
        | undefined
      if (!matchScripts) continue
      for (const script of matchScripts) {
        if (!script) continue
        const { children, ...rest } = script
        scripts.push({
          tag: 'script',
          attrs: { ...rest, nonce },
          children,
        } as any)
      }
    }

    const assetScripts: Array<RouterManagedTag> = []
    const manifest = (router as any).ssr?.manifest
    if (manifest) {
      for (const match of matches) {
        const route = router.looseRoutesById[match.routeId]
        if (!route) continue
        const assets = manifest.routes[route.id]?.assets
        if (!assets) continue
        for (const asset of assets) {
          if (asset.tag !== 'script') continue
          assetScripts.push({
            tag: 'script',
            attrs: { ...asset.attrs, nonce },
            children: asset.children,
          } as any)
        }
      }
    }

    let serverBufferedScript: RouterManagedTag | undefined
    if ((router as any).serverSsr) {
      serverBufferedScript = (router as any).serverSsr.takeBufferedScripts()
    }

    const all = [...scripts, ...assetScripts]
    if (serverBufferedScript) all.unshift(serverBufferedScript)
    return all
  })

  function escapeAttr(v: unknown): string {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
  }

  const scriptsHtml = $derived(
    allScripts
      .map((s) => {
        const attrs = Object.entries((s as any).attrs ?? {})
          .filter(([, v]) => v !== undefined && v !== null && v !== false)
          .map(([k, v]) =>
            v === true ? ` ${k}` : ` ${k}="${escapeAttr(v)}"`,
          )
          .join('')
        const children = (s as any).children ?? ''
        return `<${'script'}${attrs}>${children}</${'script'}>`
      })
      .join(''),
  )
</script>

<!-- The router's own dehydration/bootstrap scripts, serialized above. These
must reach the document as executable script elements, so escaping is not an
option. The content is router-generated, never user input. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html scriptsHtml}
