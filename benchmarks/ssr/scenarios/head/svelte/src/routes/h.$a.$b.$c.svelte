<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  const dedupedMetaName = 'head-benchmark-shared'

  export const Route = createFileRoute('/h/$a/$b/$c')({
    head: ({ params }) => ({
      meta: [
        { title: `SSR Head L3 ${params.a} ${params.b} ${params.c}` },
        ...Array.from({ length: 10 }, (_, index) => ({
          name: index === 0 ? dedupedMetaName : `level-3-meta-${index}`,
          content:
            index === 0
              ? `shared-${params.c}-level-3`
              : `c-${params.c}-${index}`,
        })),
      ],
      links: Array.from({ length: 4 }, (_, index) => ({
        rel: 'preload',
        as: 'image',
        href: `/img/${params.c}-${index}.png`,
      })),
    }),
  })
</script>

<p>head-level-c</p>
