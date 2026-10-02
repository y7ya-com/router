<script module lang="ts">
  import { linkOptions } from '@tanstack/svelte-router'

  const ROUTES = linkOptions([
    { to: '/shared-a', label: '/shared-a' },
    { to: '/shared-b', label: '/shared-b' },
    { to: '/shared-c', label: '/shared-c' },
  ])
</script>

<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import type { Snippet } from 'svelte'
  import styles from '~/styles/shared-layout.module.css'

  let { children }: { children?: Snippet } = $props()
</script>

<section class={styles.layout} data-testid="shared-layout-shell">
  <div class={styles.heading} data-testid="shared-layout-heading">
    Shared nested layout CSS
  </div>

  <nav class={styles.nav}>
    {#each ROUTES as route (route.to)}
      <Link {...route} data-testid={`nav-${route.label}`}>
        {route.label}
      </Link>
    {/each}
  </nav>

  <div class={styles.body} data-testid="shared-layout-copy">
    {@render children?.()}
  </div>
</section>
