import { createServerFn } from '@tanstack/svelte-start'
import {
  getRequestHeaders,
  setResponseHeader,
} from '@tanstack/svelte-start/server'

export const getTestHeaders = createServerFn().handler(() => {
  setResponseHeader('x-test-header', 'test-value')
  const reqHeaders = Object.fromEntries(getRequestHeaders().entries())

  return {
    serverHeaders: reqHeaders,
    headers: reqHeaders,
  }
})
