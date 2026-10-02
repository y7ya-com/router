import { createServerFn } from '@tanstack/svelte-start'
import { z } from 'zod'

export const $stringPost = createServerFn({ method: 'POST' })
  .validator(z.string())
  .handler((ctx) => ctx.data)

export const $stringGet = createServerFn({ method: 'GET' })
  .validator(z.string())
  .handler((ctx) => ctx.data)

export const $undefinedPost = createServerFn({ method: 'POST' })
  .validator(z.undefined())
  .handler((ctx) => ctx.data)

export const $undefinedGet = createServerFn({ method: 'GET' })
  .validator(z.undefined())
  .handler((ctx) => ctx.data)

export const $nullPost = createServerFn({ method: 'POST' })
  .validator(z.null())
  .handler((ctx) => ctx.data)

export const $nullGet = createServerFn({ method: 'GET' })
  .validator(z.null())
  .handler((ctx) => ctx.data)
