<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { getDocumentHeads } from '~/server/document'
  import { getProject } from '~/server/projects'

  export const Route = createFileRoute(
    '/$project/$version/docs/framework/$framework',
  )({
    loader: async ({ params: { project } }) => {
      const library = await getProject({ data: project })
      const documents = await getDocumentHeads()
      return {
        library,
        documents,
      }
    },
  })
</script>

<script lang="ts">
  import { Link, Outlet, useLocation } from '@tanstack/svelte-router'

  const project = Route.useLoaderData({ select: (s) => s.library })
  const documents = Route.useLoaderData({ select: (s) => s.documents })
  const pathname = useLocation({ select: (s) => s.pathname })
</script>

<div class="grid lg:grid-cols-5 lg:divide-x min-h-dvh">
  <aside>
    <div class="p-4">
      <Link
        to="/"
        activeOptions={{ exact: true }}
        class="aria-[current='page']:underline"
      >
        Home
      </Link>
    </div>
    <div class="p-4">
      <p class="mb-1 border-b">Version</p>
      <ul>
        {#each project.current.versions as version (version)}
          <li>
            <Link
              from="/$project/$version/docs/framework/$framework"
              to="/$project/$version/docs/framework/$framework/$"
              params={{ version }}
              class="aria-[current='page']:underline"
              activeOptions={{ exact: false }}
            >
              {version}
            </Link>
          </li>
        {/each}
      </ul>
    </div>
    <div class="p-4">
      <p class="mb-1 border-b">Framework</p>
      <ul>
        {#each project.current.frameworks as framework (framework)}
          <li>
            <Link
              from="/$project/$version/docs/framework/$framework"
              to="/$project/$version/docs/framework/$framework/$"
              params={{ framework }}
              class="aria-[current='page']:underline"
              activeOptions={{ exact: false }}
            >
              {framework}
            </Link>
          </li>
        {/each}
      </ul>
    </div>
    <div class="p-4">
      <p class="mb-1 border-b">Content</p>
      <ul>
        {#each documents.current as doc (doc.id)}
          <li>
            <Link
              from="/$project/$version/docs/framework/$framework"
              to="/$project/$version/docs/framework/$framework/$"
              params={{ _splat: doc.id }}
              class="aria-[current='page']:underline"
            >
              {doc.title}
            </Link>
          </li>
        {/each}
      </ul>
    </div>
    <div class="p-4">
      <p class="mb-1 border-b">Examples</p>
      <ul>
        {#each project.current.examples as example (example)}
          <li>
            <Link
              from="/$project/$version/docs/framework/$framework"
              to="/$project/$version/docs/framework/$framework/examples/$"
              params={{ _splat: example }}
              class="aria-[current='page']:underline"
            >
              {example}
            </Link>
          </li>
        {/each}
      </ul>
    </div>
  </aside>
  <main class="lg:col-span-4 p-4">
    <p
      class="text-sm lg:text-base pb-4 border-b break-all"
      data-testid="selected-route-label"
    >
      {pathname.current}
    </p>
    <Outlet />
  </main>
</div>
