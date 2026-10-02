import { createIsomorphicFn, createServerFn } from '@tanstack/svelte-start'

export const getEnv = createIsomorphicFn()
  .server(() => 'server')
  .client(() => 'client')

export const getServerEnv = createServerFn().handler(() => getEnv())

export const getEcho = createIsomorphicFn()
  .server((input: string) => 'server received ' + input)
  .client((input) => 'client received ' + input)

export const getServerEcho = createServerFn()
  .validator((input: string) => input)
  .handler(({ data }) => getEcho(data))
