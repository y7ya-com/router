<script module lang="ts">
  import { createRootRoute } from '@tanstack/svelte-router'
  import { rootHead } from '../../../shared'

  export const Route = createRootRoute({
    head: rootHead,
  })
</script>

<script lang="ts">
  import { HeadContent, Link, Outlet } from '@tanstack/svelte-router'
  import { articleIds, docsSections } from '../../../shared'
</script>

<HeadContent />
<nav>
  <Link to="/" data-testid="go-home" activeProps={{ class: 'active' }}>
    Home
  </Link>
  {#each docsSections as section (section)}
    <Link
      to="/docs/$section"
      params={{ section }}
      data-testid={`go-docs-${section}`}
      activeProps={{ class: 'active' }}
    >
      {`Docs ${section}`}
    </Link>
  {/each}
  {#each articleIds as id (id)}
    <Link
      to="/articles/$id"
      params={{ id }}
      data-testid={`go-article-${id}`}
      activeProps={{ class: 'active' }}
    >
      {`Article ${id}`}
    </Link>
  {/each}
  <Link
    to="/settings"
    data-testid="go-settings"
    activeProps={{ class: 'active' }}
  >
    Settings
  </Link>
</nav>
<Outlet />
