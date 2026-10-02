import {
  createClientOnlyFn,
  createServerFn,
  createServerOnlyFn,
} from '@tanstack/svelte-start'

export const serverEcho = createServerOnlyFn(
  (input: string) => 'server got: ' + input,
)
export const clientEcho = createClientOnlyFn(
  (input: string) => 'client got: ' + input,
)

export const testOnServer = createServerFn().handler(() => {
  const serverOnServer = serverEcho('hello')
  let clientOnServer: string
  try {
    clientOnServer = clientEcho('hello')
  } catch (e) {
    clientOnServer =
      'clientEcho threw an error: ' +
      (e instanceof Error ? e.message : String(e))
  }
  return { serverOnServer, clientOnServer }
})
