<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/')({})
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div>
  <Link
    from={Route.fullPath}
    to="./$target"
    params={{ target: 'internal' }}
    activeProps={{
      class: 'font-bold',
    }}
  >
    internal
  </Link>{' '}
  <Link
    from={Route.fullPath}
    to="./$target"
    params={{ target: 'external' }}
    activeProps={{
      class: 'font-bold',
    }}
  >
    external
  </Link>
</div>
