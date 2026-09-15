import { defineHandlerCallback } from '@tanstack/router-core/ssr/server'
import { renderRouterToStream } from './renderRouterToStream.js'

export const defaultStreamHandler = defineHandlerCallback(
  ({ request, router, responseHeaders }) =>
    renderRouterToStream({ request, router, responseHeaders }),
)
