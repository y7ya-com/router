<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import '../styles/assets-a.css'

  export const Route = createFileRoute('/a/$x')({
    head: ({ params }) => ({
      meta: [{ title: `SSR Assets ${params.x}` }],
      links: Array.from({ length: 2 }, (_, index) => ({
        rel: 'preload',
        as: 'image',
        href: `/asset-preload/${params.x}-${index}.png`,
      })),
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'

  const params = Route.useParams()
</script>

<section class="assets-level-a">
  <p>assets-level-a-{params.current.x}</p>
  <Outlet />
</section>
