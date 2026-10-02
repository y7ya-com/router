<script module lang="ts">
  import { linkOptions } from '@tanstack/svelte-router'

  const ROUTES = linkOptions([
    { to: '/', label: 'home' },
    { to: '/a', label: '/a' },
    { to: '/b', label: '/b' },
    { to: '/lazy-css-static', label: '/lazy-css-static' },
    { to: '/lazy-css-lazy', label: '/lazy-css-lazy' },
    { to: '/r1', label: '/r1' },
    { to: '/r2', label: '/r2' },
    { to: '/shared-a', label: '/shared-a' },
  ])
</script>

<script lang="ts">
  import { ClientOnly, Link, Outlet } from '@tanstack/svelte-router'
  import styles from '~/styles/root-shell.module.css'
</script>

<div class={styles.shell}>
  <nav class={styles.nav}>
    {#each ROUTES as route (route.to)}
      <Link {...route} data-testid={`nav-${route.label}`}>
        {route.label}
      </Link>
    {/each}
  </nav>

  <main class={styles.content}>
    <div class={styles.rootBadge} data-testid="root-shell-marker">
      Start manifest CSS root shell
    </div>
    <ClientOnly>
      <div data-testid="hydration-marker">hydrated</div>
    </ClientOnly>
    <Outlet />
  </main>
</div>
