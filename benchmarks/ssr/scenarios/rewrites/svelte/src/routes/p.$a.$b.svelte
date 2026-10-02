<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/p/$a/$b')({
    loader: ({ params }) => ({
      a: params.a,
      b: params.b,
      nextB: `next-${params.b}`,
    }),
  })
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  const data = Route.useLoaderData()
</script>

<section>
  <p>
    rewrite-leaf {data.current.a}
    {data.current.b}
  </p>
  <Link
    to="/p/$a/$b"
    params={{ a: data.current.a, b: data.current.b }}
    search={{ _locale: 'fr' }}
  >
    leaf-self-link
  </Link>
  <Link
    to="/p/$a/$b"
    params={{ a: data.current.a, b: data.current.nextB }}
    search={{ _locale: 'fr' }}
  >
    leaf-next-link
  </Link>
  <Link to="/p/$a" params={{ a: data.current.a }} search={{ _locale: 'fr' }}>
    leaf-parent-link
  </Link>
</section>
