import {
  createRequestHandler,
  renderRouterToString,
} from '@tanstack/svelte-router/ssr/server'
import { createRouter } from './router'
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express'

export async function render({
  req,
  res,
  head,
}: {
  head: string
  req: ExpressRequest
  res: ExpressResponse
}) {
  const url = new URL(req.originalUrl || req.url, 'http://localhost:3000').href

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value)
  }
  const request = new Request(url, { method: req.method, headers })

  const handler = createRequestHandler({ request, createRouter })

  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({ responseHeaders, router }),
  )

  // Forward the router's response headers to express. This carries the
  // `Location` header for server-side redirects (a loader throwing
  // `redirect()`) — core builds it via `getRequestHeaders`/`resolveRedirect` —
  // as well as any per-route `headers`. Without this, a 307/redirect goes out
  // with no target. `content-length` is skipped because the HTML is rewritten
  // below (vite head + client entry), so express must recompute it on `end`.
  for (const [key, value] of response.headers) {
    if (key.toLowerCase() === 'content-length') continue
    res.setHeader(key, value)
  }

  // A redirect has no HTML body to render — emit the status + headers and stop.
  if (response.status >= 300 && response.status < 400) {
    res.status(response.status).end()
    return
  }

  let html = await response.text()
  // Inject vite's dev <head> (HMR client) and the client entry so the
  // server-rendered page hydrates.
  html = html.replace('</head>', `${head}</head>`)
  html = html.replace(
    '</body>',
    `<script type="module" src="/src/entry-client.ts"></script></body>`,
  )

  res.status(response.status)
  if (!res.getHeader('content-type')) res.setHeader('content-type', 'text/html')
  res.end(html)
}
