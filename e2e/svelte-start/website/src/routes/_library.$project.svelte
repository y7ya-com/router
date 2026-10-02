<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { getProject } from '~/server/projects'
  import { seo } from '~/utils/seo'

  export const Route = createFileRoute('/_library/$project')({
    loader: ({ params: { project } }) => getProject({ data: project }),
    head: ({ loaderData }) => ({
      meta: seo({ title: `TanStack ${loaderData?.name || 'Project'}` }),
    }),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<div class="p-2">
  <Outlet />
</div>
