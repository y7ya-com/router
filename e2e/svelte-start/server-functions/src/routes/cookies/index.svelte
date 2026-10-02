<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { z } from 'zod'

  const cookieSchema = z
    .object({ value: z.string().default(() => `CLIENT-${Date.now()}`) })
    .prefault({})
    .catch(() => ({ value: `CLIENT-${Date.now()}` }))

  export const Route = createFileRoute('/cookies/')({
    validateSearch: cookieSchema,
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const search = Route.useSearch()
</script>

<Link
  data-testid="link-to-set"
  from="/cookies/"
  to="./set"
  search={search.current}
>
  got to route that sets the cookies with {JSON.stringify(search.current)}
</Link>
