import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/svelte-start/server'
import type { Register } from '@tanstack/svelte-router'
import type { RequestHandler } from '@tanstack/svelte-start/server'

const fetch = createStartHandler(defaultStreamHandler)

// Providing `RequestHandler` from `@tanstack/svelte-start/server` is required
// so the output types don't import it from `@tanstack/start-server-core`.
export type ServerEntry = { fetch: RequestHandler<Register> }

export function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(...args) {
      return await entry.fetch(...args)
    },
  }
}

export default createServerEntry({ fetch })
