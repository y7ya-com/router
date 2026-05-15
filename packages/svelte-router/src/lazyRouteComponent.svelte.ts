import { isModuleNotFoundError } from '@tanstack/router-core'
import LazyComponent from './LazyComponent.svelte'

/**
 * Wraps a dynamic `import()` so the resulting Svelte component is loaded only
 * when first rendered. Returned value is itself a Svelte 5 component callable
 * — the route tree wires it as `component: lazyRouteComponent(...)`.
 *
 * Mirrors `lazyRouteComponent` from `react-router` / `solid-router`: a shared
 * load promise (so concurrent renders don't double-fetch), a `.preload()`
 * hook the router can call on intent/viewport hints, and a one-shot
 * recovery on `ModuleNotFoundError` (so stale-deploy URLs trigger a single
 * window reload instead of crashing the app).
 */
export function lazyRouteComponent<
  T extends Record<string, any>,
  TKey extends keyof T = 'default',
>(importer: () => Promise<T>, exportName?: TKey): any {
  let loadPromise: Promise<any> | undefined
  let resolvedComp: any = undefined
  let loadError: any = undefined

  const load = () => {
    if (!loadPromise) {
      loadPromise = importer()
        .then((mod) => {
          loadPromise = undefined
          resolvedComp = mod[exportName ?? ('default' as any)]
          return resolvedComp
        })
        .catch((err) => {
          loadError = err
        })
    }
    return loadPromise
  }

  // Build a Svelte component callable. We delegate to a shared
  // `LazyComponent.svelte` for the actual `{#await}` render dance — keeping
  // the SFC-emit confined to one tiny file rather than synthesising a
  // component function by hand here (which the Svelte 5 callable contract
  // makes brittle to reproduce).
  const wrapped: any = (internals: any, props: any) => {
    // Recover from stale-deploy module-not-found by reloading once. Mirrors
    // the React / Solid versions of this guard.
    if (loadError) {
      if (
        isModuleNotFoundError(loadError) &&
        loadError instanceof Error &&
        typeof window !== 'undefined' &&
        typeof sessionStorage !== 'undefined'
      ) {
        const storageKey = `tanstack_router_reload:${loadError.message}`
        if (!sessionStorage.getItem(storageKey)) {
          sessionStorage.setItem(storageKey, '1')
          window.location.reload()
          return null
        }
      }
      throw loadError
    }
    return (LazyComponent as any)(internals, {
      load,
      getComp: () => resolvedComp,
      childProps: props,
    })
  }

  wrapped.preload = load
  return wrapped
}
