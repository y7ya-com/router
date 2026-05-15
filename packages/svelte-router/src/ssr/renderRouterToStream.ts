import type { AnyRouter } from '@tanstack/router-core'

/**
 * v1 stub: Svelte's streaming SSR story differs from Solid/React.
 * For v1 the function exists but routes to the string renderer.
 * TODO(svelte-port): full streaming implementation via Svelte 5's render + suspense.
 */
export const renderRouterToStream = async ({
  router,
  responseHeaders,
}: {
  request: Request
  router: AnyRouter
  responseHeaders: Headers
  children?: () => unknown
}) => {
  const { renderRouterToString } = await import('./renderRouterToString')
  return renderRouterToString({ router, responseHeaders })
}
