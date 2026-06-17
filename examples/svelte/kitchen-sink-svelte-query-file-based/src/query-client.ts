import { QueryClient } from '@tanstack/svelte-query'

// A single shared QueryClient. Loaders import it directly to prefetch, and the
// same instance is handed to `setupRouterSsrQueryIntegration` so components get
// it from context. (A typed `queryClient` on the router *context* would be
// nicer, but the Svelte route-generator doesn't yet thread the root
// `createRootRouteWithContext` type into the generated tree — runtime is fine,
// the types just don't flow — so we use a module singleton instead.)
export const queryClient = new QueryClient({
  // `retry: false` keeps the `/posts/9999` notFound() immediate instead of
  // retrying the failing fetch first.
  defaultOptions: { queries: { staleTime: 60_000, retry: false } },
})
