import { batch, createAtom } from '@tanstack/svelte-store'
import {
  createNonReactiveMutableStore,
  createNonReactiveReadonlyStore,
} from '@tanstack/router-core'
import { isServer } from '@tanstack/router-core/isServer'
import type { Readable } from '@tanstack/svelte-store'
import type {
  AnyRoute,
  GetStoreConfig,
  RouterReadableStore,
  RouterStores,
} from '@tanstack/router-core'

declare module '@tanstack/router-core' {
  export interface RouterReadableStore<TValue> extends Readable<TValue> {}

  // eslint-disable-next-line unused-imports/no-unused-vars -- carried for consumers that parameterize their stores by route tree
export interface RouterStores<in out TRouteTree extends AnyRoute> {
    /** Maps each active routeId to the matchId of its child in the match tree. */
    childMatchIdByRouteId: RouterReadableStore<Record<string, string>>
    /** Maps each pending routeId to true for quick lookup. */
    pendingRouteIds: RouterReadableStore<Record<string, boolean>>
  }
}

function initRouterStores(
  stores: RouterStores<AnyRoute>,
  createReadonlyStore: <TValue>(
    read: () => TValue,
  ) => RouterReadableStore<TValue>,
) {
  stores.childMatchIdByRouteId = createReadonlyStore(() => {
    const ids = stores.matchesId.get()
    const obj: Record<string, string> = {}
    for (let i = 0; i < ids.length - 1; i++) {
      const parentStore = stores.matchStores.get(ids[i]!)
      if (parentStore?.routeId) {
        obj[parentStore.routeId] = ids[i + 1]!
      }
    }
    return obj
  })

  stores.pendingRouteIds = createReadonlyStore(() => {
    const ids = stores.pendingIds.get()
    const obj: Record<string, boolean> = {}
    for (const id of ids) {
      const store = stores.pendingMatchStores.get(id)
      if (store?.routeId) {
        obj[store.routeId] = true
      }
    }
    return obj
  })
}

/**
 * Wrap a non-reactive store so it satisfies the `Readable` interface with a
 * no-op `subscribe`. Lets consumers call `useSelector` on it without crashing
 * in server / non-reactive contexts.
 */
function addNoopSubscribe<T extends { get: () => any }>(store: T): T {
  if ('subscribe' in store) return store
  return Object.assign(store, {
    subscribe: () => ({ unsubscribe: () => {} }),
  }) as T
}

const ssrCreateMutableStore = <TValue>(initialValue: TValue) =>
  addNoopSubscribe(createNonReactiveMutableStore(initialValue))
const ssrCreateReadonlyStore = <TValue>(read: () => TValue) =>
  addNoopSubscribe(createNonReactiveReadonlyStore(read))

export const getStoreFactory: GetStoreConfig = (opts) => {
  if (isServer ?? opts.isServer) {
    return {
      createMutableStore: ssrCreateMutableStore as any,
      createReadonlyStore: ssrCreateReadonlyStore,
      batch: (fn) => fn(),
      init: (stores) => initRouterStores(stores, ssrCreateReadonlyStore),
    }
  }
  return {
    createMutableStore: createAtom,
    createReadonlyStore: createAtom,
    batch,
    init: (stores) => initRouterStores(stores, createAtom),
  }
}
