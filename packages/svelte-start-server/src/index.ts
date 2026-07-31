export { default as StartServer } from './StartServer.svelte'
// The Svelte adapter's render handlers live in @tanstack/svelte-router/ssr —
// its renderRouterToString/renderRouterToStream render the RouterServer shell
// themselves (Svelte can't take a rendered tree as a value), so the handlers
// are re-exported rather than re-implemented around a `children` closure.
export {
  defaultRenderHandler,
  defaultStreamHandler,
} from '@tanstack/svelte-router/ssr/server'
export type {
  RequestHandler,
  RequestOptions,
} from '@tanstack/start-server-core'
export * from '@tanstack/start-server-core'
