import type { QueryClient } from '@tanstack/query-core'
import type { AnyRouter } from '@tanstack/svelte-router'
import type { Component, Snippet } from 'svelte'

/**
 * State the `SsrQueryWrap` component needs at render time.
 *
 * In React/Solid the integration sets `router.options.Wrap` to a closure that
 * captures the `QueryClient`. Svelte components can't capture runtime values
 * that way, and `Wrap` is only handed its `children` snippet — so the client
 * (and any pre-existing `Wrap`) are stashed here, keyed by router, and read
 * back inside `SsrQueryWrap.svelte` via `useRouter()`.
 */
export type SsrQueryWrapState = {
  client: QueryClient
  ogWrap?: Component<{ children: Snippet }>
}

export const ssrQueryStateByRouter = new WeakMap<AnyRouter, SsrQueryWrapState>()
