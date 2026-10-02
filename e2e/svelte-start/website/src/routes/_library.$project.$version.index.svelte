<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/_library/$project/$version/')()
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const params = Route.useParams()
</script>

<div>
  <h1 class="text-2xl mb-2" data-testid="landing-page-heading">
    {params.current.project} landing page
  </h1>
  <p data-testid="landing-page-version">
    version: {params.current.version}
  </p>
  <p>
    <Link aria-label="Documentation" from="/$project/$version/" to="./docs">
      Get started with our documentation.
    </Link>
  </p>
</div>
