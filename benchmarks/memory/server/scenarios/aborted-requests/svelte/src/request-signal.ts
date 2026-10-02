import { createServerOnlyFn } from '@tanstack/svelte-start'
import { getRequest } from '@tanstack/svelte-start/server'

export const getRequestSignal = createServerOnlyFn(() => getRequest().signal)
