import { defineHandlerCallback } from '@tanstack/router-core/ssr/server'
import { renderRouterToString } from './renderRouterToString'

export const defaultRenderHandler = defineHandlerCallback(
  ({ router, responseHeaders }) =>
    renderRouterToString({ router, responseHeaders }),
)
