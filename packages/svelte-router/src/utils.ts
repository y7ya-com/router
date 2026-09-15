import { isServer } from '@tanstack/router-core/isServer'
import { useSelector } from '@tanstack/svelte-store'
import type { AnyRouter } from '@tanstack/router-core'
import type { Component, Snippet } from 'svelte'

const SNIPPET_SYMBOL = Symbol.for('svelte.snippet')

export function isSnippet(value: unknown): value is Snippet<Array<unknown>> {
  return (
    typeof value === 'function' &&
    (SNIPPET_SYMBOL in value ||
      Object.getOwnPropertySymbols(value).some((s) =>
        s.description?.includes('snippet'),
      ))
  )
}

export function isComponent(value: unknown): value is Component<any> {
  return typeof value === 'function' && !isSnippet(value)
}

/**
 * Svelte boundaries hand over the raw thrown value; error components and
 * `onCatch` receive an `Error`, as in the other adapters.
 */
export function toError(thrown: unknown): Error {
  if (thrown instanceof Error) {
    return thrown
  }
  return new Error(typeof thrown === 'string' ? thrown : 'Unknown error', {
    cause: thrown,
  })
}

/**
 * Whether a `<script>` with these attributes runs when inserted. Data blocks
 * (e.g. `application/ld+json`) only need to be present in the document.
 */
export function isExecutableScript(attrs?: Record<string, any>): boolean {
  const type = attrs?.type
  return (
    typeof type !== 'string' ||
    type === '' ||
    type === 'text/javascript' ||
    type === 'module'
  )
}

/**
 * Subscribe to a router store slice. A server router renders once, so it reads
 * the store directly instead of subscribing.
 */
export function useRouterSelector<TState, TSelected = TState>(
  router: AnyRouter,
  store: { get: () => TState },
  selector: (state: TState) => TSelected = (state) =>
    state as unknown as TSelected,
): { readonly current: TSelected } {
  if (isServer ?? router.isServer) {
    const selected = selector(store.get())
    return {
      get current() {
        return selected
      },
    }
  }
  return useSelector(store as any, selector as (state: unknown) => TSelected)
}
