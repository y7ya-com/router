<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import DocumentNotFound from '~/components/DocumentNotFound.svelte'
  import PostError from '~/components/PostError.svelte'
  import { getDocument } from '~/server/document'
  import { capitalize, seo } from '~/utils/seo'

  export const Route = createFileRoute(
    '/$project/$version/docs/framework/$framework/$',
  )({
    loader: ({ params: { _splat } }) =>
      getDocument({
        data: _splat!,
      }),
    head: ({ loaderData, params }) => ({
      meta: seo({
        title: `${loaderData?.title || 'Project'} | TanStack ${capitalize(params.project)} ${capitalize(params.framework)}`,
      }),
    }),
    errorComponent: PostError,
    notFoundComponent: DocumentNotFound,
  })
</script>

<script lang="ts">
  const post = Route.useLoaderData()
</script>

<div class="space-y-2">
  <h4 data-testid="selected-doc-heading" class="text-xl font-bold underline">
    {post.current.title}
  </h4>
  <div class="text-sm">{post.current.content}</div>
</div>
