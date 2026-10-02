<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/not-found/')({})
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const preload = Route.useSearch({ select: (s) => s.preload })
</script>

<div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-beforeLoad"
      preload={preload.current}
      data-testid="via-beforeLoad"
    >
      via-beforeLoad
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-loader"
      preload={preload.current}
      data-testid="via-loader"
    >
      via-loader
    </Link>
  </div>
</div>
