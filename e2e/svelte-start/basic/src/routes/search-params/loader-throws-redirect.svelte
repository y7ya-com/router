<script module lang="ts">
  import { redirect, createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  export const Route = createFileRoute('/search-params/loader-throws-redirect')(
    {
      validateSearch: z.object({
        step: z.enum(['a', 'b', 'c']).optional(),
      }),
      loaderDeps: ({ search: { step } }) => ({ step }),
      loader: ({ deps: { step } }) => {
        if (step === undefined) {
          throw redirect({
            to: '/search-params/loader-throws-redirect',
            search: { step: 'a' },
          })
        }
      },
    },
  )
</script>

<script lang="ts">
  const search = Route.useSearch()
</script>

<div>
  <h1>SearchParams</h1>
  <div data-testid="search-param">{search.current.step}</div>
</div>
