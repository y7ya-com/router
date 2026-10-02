<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  const dedupedMetaName = 'head-benchmark-shared'

  export const Route = createFileRoute('/h/$a')({
    head: ({ params }) => ({
      meta: [
        { title: `SSR Head L1 ${params.a}` },
        ...Array.from({ length: 10 }, (_, index) => ({
          name: index === 0 ? dedupedMetaName : `level-1-meta-${index}`,
          content:
            index === 0
              ? `shared-${params.a}-level-1`
              : `c-${params.a}-${index}`,
        })),
      ],
      links: Array.from({ length: 4 }, (_, index) => ({
        rel: 'preload',
        as: 'image',
        href: `/img/${params.a}-${index}.png`,
      })),
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<p>head-level-a</p>
<Outlet />
