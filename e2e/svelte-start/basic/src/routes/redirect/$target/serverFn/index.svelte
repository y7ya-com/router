<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/redirect/$target/serverFn/')({})
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const params = Route.useParams()
</script>

<div>
  <h1 class="mb-4 text-4xl font-extrabold lmd:text-5xl lg:text-6xl">
    redirect test with server functions (target {params.current.target})
  </h1>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-beforeLoad"
      activeProps={{
        class: 'font-bold',
      }}
      data-testid="via-beforeLoad"
    >
      via-beforeLoad
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-beforeLoad"
      search={{ reloadDocument: true }}
      activeProps={{
        class: 'font-bold',
      }}
      data-testid="via-beforeLoad-reloadDocument"
    >
      via-beforeLoad (reloadDocument=true)
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-loader"
      activeProps={{
        class: 'font-bold',
      }}
      data-testid="via-loader"
    >
      via-loader
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-loader"
      activeProps={{
        class: 'font-bold',
      }}
      search={{ reloadDocument: true }}
      data-testid="via-loader-reloadDocument"
    >
      via-loader (reloadDocument=true)
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-useServerFn"
      activeProps={{
        class: 'font-bold',
      }}
      data-testid="via-useServerFn"
    >
      via-useServerFn
    </Link>
  </div>
  <div class="mb-2">
    <Link
      from={Route.fullPath}
      to="./via-useServerFn"
      activeProps={{
        class: 'font-bold',
      }}
      search={{ reloadDocument: true }}
      data-testid="via-useServerFn-reloadDocument"
    >
      via-useServerFn (reloadDocument=true)
    </Link>
  </div>
</div>
