import { setupCoreRouterSsrQueryIntegration } from '@tanstack/router-ssr-query-core'
import { ssrQueryStateByRouter } from './wrap-context'
import SsrQueryWrap from './SsrQueryWrap.svelte'
import type { RouterSsrQueryOptions } from '@tanstack/router-ssr-query-core'
import type { AnyRouter } from '@tanstack/svelte-router'

export type Options<TRouter extends AnyRouter> =
  RouterSsrQueryOptions<TRouter> & {
    /**
     * When `false`, the integration won't wrap the router in a
     * `QueryClientProvider` — provide the `QueryClient` yourself (e.g. with
     * `<QueryClientProvider>` at your app root). Defaults to `true`.
     */
    wrapQueryClient?: boolean
  }

/**
 * Wire `@tanstack/svelte-query` into a TanStack Router (Svelte) router so query
 * cache state dehydrates on the server and hydrates on the client, and so the
 * `QueryClient` is available to `createQuery`/`createMutation` everywhere in the
 * route tree. Mirrors `@tanstack/solid-router-ssr-query` /
 * `@tanstack/react-router-ssr-query`.
 */
export function setupRouterSsrQueryIntegration<TRouter extends AnyRouter>(
  opts: Options<TRouter>,
) {
  setupCoreRouterSsrQueryIntegration(opts)

  if (opts.wrapQueryClient === false) {
    return
  }

  ssrQueryStateByRouter.set(opts.router, {
    client: opts.queryClient,
    ogWrap: opts.router.options.Wrap,
  })

  opts.router.options.Wrap = SsrQueryWrap
}
