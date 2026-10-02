import * as fs from 'node:fs'
import { createServerFn } from '@tanstack/svelte-start'
import { getRequestHeader } from '@tanstack/svelte-start/server'

// by using this we make sure DCE still works - this errors when imported on the client

const filePath = 'count-effect.txt'

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, 'utf-8').catch(() => '0'),
  )
}

async function updateCount() {
  const count = await readCount()
  await fs.promises.writeFile(filePath, `${count + 1}`)
  return true
}

export const writeFileServerFn = createServerFn().handler(async () => {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const test = await updateCount()
  return getRequestHeader('X-Test')
})

export const readFileServerFn = createServerFn().handler(async () => {
  const data = await readCount()
  return data
})
