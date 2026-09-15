import { rootRouteId } from '@tanstack/router-core'
import type { AnyRouter } from '@tanstack/router-core'

type Attrs = Record<string, string | boolean | undefined> | undefined

function serializeAttrs(attrs: Attrs) {
  if (!attrs) {
    return ''
  }
  return Object.entries(attrs)
    .filter(([, v]) => v !== undefined && v !== false)
    .map(([k, v]) =>
      v === true
        ? ` ${k}`
        : ` ${k}="${String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`,
    )
    .join('')
}

/**
 * Wraps Svelte's `{ head, body }` render output in an `<html>` document
 * (without the doctype, which the router transport adds). Svelte components
 * cannot render `<html>`/`<body>`, so their attributes come from the root
 * route's `htmlAttrs` / `bodyAttrs` options. The document ends with the exact
 * `</body></html>` close that the stream transform recognises.
 */
export function buildDocument(
  router: AnyRouter,
  head: string,
  body: string,
): string {
  const rootOptions = router.routesById[rootRouteId]?.options as
    | { htmlAttrs?: Attrs; bodyAttrs?: Attrs }
    | undefined
  return `<html${serializeAttrs(rootOptions?.htmlAttrs)}><head>${head}</head><body${serializeAttrs(rootOptions?.bodyAttrs)}>${body}</body></html>`
}
