import { createServerFn } from '@tanstack/svelte-start'
import { getRequest } from '@tanstack/svelte-start/server'

export const abortableServerFn = createServerFn().handler(
  async ({ context }) => {
    console.log('server function started', { context })
    const signal = getRequest().signal
    return new Promise<string>((resolve, reject) => {
      if (signal.aborted) {
        return reject(new Error('Aborted before start'))
      }
      const timerId = setTimeout(() => {
        console.log('server function finished')
        resolve('server function result')
      }, 1000)
      const onAbort = () => {
        clearTimeout(timerId)
        console.log('server function aborted')
        reject(new Error('Aborted'))
      }
      signal.addEventListener('abort', onAbort, { once: true })
    })
  },
)
