import { batch, createAtom } from '@tanstack/svelte-store'
import {
  createNonReactiveMutableStore,
  createNonReactiveReadonlyStore,
} from '@tanstack/router-core'
import { isServer } from '@tanstack/router-core/isServer'
import type { Readable } from '@tanstack/svelte-store'
import type { GetStoreConfig } from '@tanstack/router-core'

declare module '@tanstack/router-core' {
  export interface RouterReadableStore<TValue> extends Readable<TValue> {}
}

export const getStoreFactory: GetStoreConfig = (opts) => {
  if (isServer ?? opts.isServer) {
    // `useSelector` subscribes from an `$effect`, which Svelte never runs
    // during SSR, so server stores only need `get`.
    return {
      createMutableStore: createNonReactiveMutableStore as any,
      createReadonlyStore: createNonReactiveReadonlyStore as any,
      batch: (fn) => fn(),
    }
  }
  return {
    createMutableStore: createAtom,
    createReadonlyStore: createAtom,
    batch,
  }
}
