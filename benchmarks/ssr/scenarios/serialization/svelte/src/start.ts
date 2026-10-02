import { createStart } from '@tanstack/svelte-start'
import { benchPointAdapter } from './serialization'

export const startInstance = createStart(() => {
  return {
    defaultSsr: true,
    serializationAdapters: [benchPointAdapter],
  }
})
