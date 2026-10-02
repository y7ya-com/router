<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import '../styles/assets-leaf.css'

  export const Route = createFileRoute('/a/$x/$y')({
    head: ({ params }) => ({
      meta: [{ title: `SSR Assets ${params.x} ${params.y}` }],
      links: Array.from({ length: 3 }, (_, index) => ({
        rel: 'preload',
        as: 'image',
        href: `/asset-preload/${params.y}-${index}.png`,
      })),
    }),
  })
</script>

<script lang="ts">
  const params = Route.useParams()
</script>

<section class="assets-leaf">
  <p>
    assets-leaf-{params.current.x}-{params.current.y}
  </p>
</section>
