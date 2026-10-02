<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/p/$a')({
    loader: ({ params }) => ({
      a: params.a,
      nextB: `branch-${params.a}`,
    }),
  })
</script>

<script lang="ts">
  import { Link, Outlet } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<section>
  <p>rewrite-parent {data.current.a}</p>
  <Link
    to="/p/$a/$b"
    params={{ a: data.current.a, b: data.current.nextB }}
    search={{ _locale: 'fr' }}
  >
    parent-branch-link
  </Link>
  <Outlet />
</section>
