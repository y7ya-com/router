import { createServerFn } from '@tanstack/svelte-start'
import { setCookie } from '@tanstack/svelte-start/server'
import { z } from 'zod'

export const cookieSchema = z.object({ value: z.string() })

export const setCookieServerFn1 = createServerFn()
  .validator(cookieSchema)
  .handler(({ data }) => {
    setCookie(`cookie-1-${data.value}`, data.value)
    setCookie(`cookie-2-${data.value}`, data.value)
  })

export const setCookieServerFn2 = createServerFn()
  .validator(cookieSchema)
  .handler(({ data }) => {
    setCookie(`cookie-3-${data.value}`, data.value)
    setCookie(`cookie-4-${data.value}`, data.value)
  })
