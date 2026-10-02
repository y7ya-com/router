<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  const dedupedMetaName = 'head-benchmark-shared'

  export const Route = createFileRoute('/h/$a/$b')({
    head: ({ params }) => ({
      meta: [
        { title: `SSR Head L2 ${params.a} ${params.b}` },
        ...Array.from({ length: 10 }, (_, index) => ({
          name: index === 0 ? dedupedMetaName : `level-2-meta-${index}`,
          content:
            index === 0
              ? `shared-${params.b}-level-2`
              : `c-${params.b}-${index}`,
        })),
      ],
      links: Array.from({ length: 4 }, (_, index) => ({
        rel: 'preload',
        as: 'image',
        href: `/img/${params.b}-${index}.png`,
      })),
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<p>head-level-b</p>
<Outlet />
