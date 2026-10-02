<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { docsSectionHead } from '../../../shared'

  export const Route = createFileRoute('/docs/$section')({
    head: ({ params }) => docsSectionHead(params.section),
  })
</script>

<script lang="ts">
  import { docsDescription, docsTitle } from '../../../shared'

  const params = Route.useParams()
</script>

<article>
  <h1>{docsTitle(params.current.section)}</h1>
  <p>{docsDescription(params.current.section)}</p>
</article>
