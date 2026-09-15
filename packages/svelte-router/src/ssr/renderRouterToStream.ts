import { render } from 'svelte/server'
import { isbot } from 'isbot'
import {
  createSsrStreamResponse,
  getSsrStatus,
  transformHtmlStringWithRouter,
  transformReadableStreamWithRouter,
} from '@tanstack/router-core/ssr/server'
import RouterServer from './RouterServer.svelte'
import { buildDocument } from './document.js'
import type { AnyRouter } from '@tanstack/router-core'
import type { Component } from 'svelte'

const encoder = new TextEncoder()

/**
 * Renders the document, then streams the router's hydration data after it —
 * deferred loader promises included, as they resolve — through router-core's
 * stream transform, so `<Await>` resolves on the client with no refetch.
 *
 * Svelte 5's `svelte/server` returns the whole document from one `render()`
 * call, with no primitive for flushing a shell and patching resolved subtrees
 * in later. The application output is therefore one eager record and, like
 * Vue, uses no renderer safe points beyond the boundary, the canonical
 * `</body></html>` close and EOF (see router-core's `ssr/STREAMING.md`).
 */
export const renderRouterToStream = async ({
  request,
  router,
  responseHeaders,
}: {
  request: Request
  router: AnyRouter
  responseHeaders: Headers
  children?: () => unknown
}) => {
  const signal = request.signal
  if (signal.aborted) {
    router.serverSsr?.cleanup()
    throw signal.reason
  }

  try {
    const RootComponent = RouterServer as Component<Record<string, any>>
    const { head, body } = await render(RootComponent, { props: { router } })
    const document = buildDocument(router, head, body)

    // Bots get the complete document, deferred data included, in one piece.
    if (isbot(request.headers.get('User-Agent'))) {
      const fullHtml = await transformHtmlStringWithRouter(router, document, {
        signal,
      })
      return new Response(fullHtml, {
        status: getSsrStatus(router),
        headers: responseHeaders,
      })
    }

    const html = '<!DOCTYPE html>' + document

    const readable = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(html))
        controller.close()
      },
    })
    const responseStream = transformReadableStreamWithRouter(router, readable, {
      signal,
    })
    return createSsrStreamResponse(
      router,
      new Response(responseStream, {
        status: getSsrStatus(router),
        headers: responseHeaders,
      }),
    )
  } catch (error) {
    router.serverSsr?.cleanup()
    throw error
  }
}
