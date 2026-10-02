<script lang="ts">
  import { Link, Outlet, createLink } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'

  const SvgLink = createLink('a')
</script>

<div class="p-2 flex gap-2 text-lg border-b">
  <Link
    to="/"
    activeProps={{ class: 'font-bold' }}
    activeOptions={{ exact: true }}
  >
    Home
  </Link>
  <Link to="/posts" activeProps={{ class: 'font-bold' }}>Posts</Link>
  <Link to="/posts" viewTransition>View Transition</Link>
  <Link to="/posts" viewTransition={{ types: ['dummy'] }}>
    View Transition types
  </Link>
  <Link to="/layout-a" activeProps={{ class: 'font-bold' }}>Layout</Link>
  <!-- Deliberately unknown route (exercises the not-found view); the cast
       stands in for `@ts-expect-error`, which Svelte markup cannot carry. -->
  <Link
    to={'/this-route-does-not-exist' as any}
    activeProps={{ class: 'font-bold' }}
  >
    This Route Does Not Exist
  </Link>
  <div class="flex items-center">
    <svg width="20" height="20" viewBox="0 0 20 20" role="img">
      <title id="rectTitle">Link in SVG</title>
      <SvgLink
        to="/posts"
        aria-label="Open posts from SVG"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="0"
          y="0"
          width="20"
          height="20"
          rx="4"
          fill="blue"
          stroke-width="2"
        />
      </SvgLink>
    </svg>
  </div>
</div>
<Outlet />
<TanStackRouterDevtools position="bottom-right" />
