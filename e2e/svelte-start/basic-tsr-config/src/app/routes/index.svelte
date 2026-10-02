<script module lang="ts">
  import * as fs from 'node:fs'
  import { createFileRoute } from '@tanstack/svelte-router'
  import { createServerFn } from '@tanstack/svelte-start'

  const filePath = 'count.txt'

  const getCount = createServerFn({
    method: 'GET',
  }).handler(async () => {
    const number = await fs.promises
      .readFile(filePath, 'utf-8')
      .catch(() => '0')
    return parseInt(number || '0')
  })

  const updateCount = createServerFn({ method: 'POST' })
    .validator((d: number) => d)
    .handler(async ({ data }) => {
      const count = await getCount()
      await fs.promises.writeFile(filePath, `${count + data}`)
    })

  export const Route = createFileRoute('/')({
    loader: async () => await getCount(),
  })
</script>

<script lang="ts">
  import { useRouter } from '@tanstack/svelte-router'

  const router = useRouter()
  const state = Route.useLoaderData()
</script>

<button
  data-testid="add-button"
  onclick={() => {
    updateCount({ data: 1 }).then(() => {
      router.invalidate()
    })
  }}
>
  Add 1 to {state.current}?
</button>
