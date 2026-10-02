import { createServerFn } from '@tanstack/svelte-start'
import { setResponseStatus } from '@tanstack/svelte-start/server'
import { z } from 'zod'
import { CustomError } from '~/CustomError'

const schema = z.object({ hello: z.string() })
export const serverFnThrowing = createServerFn()
  .validator(schema)
  .handler(async ({ data }) => {
    if (data.hello === 'world') {
      return 'Hello, world!'
    }
    setResponseStatus(499)
    throw new CustomError('Invalid input', { foo: 'bar', bar: BigInt(123) })
  })
