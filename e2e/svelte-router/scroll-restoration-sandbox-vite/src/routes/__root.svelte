<script lang="ts">
  import {
    HeadContent,
    Link,
    Outlet,
    linkOptions,
  } from '@tanstack/svelte-router'
  import { TanStackRouterDevtools } from '@tanstack/svelte-router-devtools'

  function navLinks(type: 'header' | 'footer') {
    return [
      linkOptions({ to: '/normal-page' }),
      linkOptions({ to: '/lazy-page' }),
      linkOptions({ to: '/virtual-page' }),
      linkOptions({ to: '/lazy-with-loader-page' }),
      linkOptions({ to: '/page-with-search', search: { where: type } }),
    ] as const
  }
</script>

{#snippet Nav(type: 'header' | 'footer')}
  {@const prefix = type === 'header' ? 'Head' : 'Foot'}
  <svelte:element this={type} class="p-2 flex gap-2 text-lg">
    <Link
      to="/"
      activeProps={{
        class: 'font-bold',
      }}
      activeOptions={{ exact: true }}
    >
      {prefix}-/
    </Link>
    {#each navLinks(type) as options}
      <Link
        {...options}
        activeProps={{
          class: 'font-bold',
        }}
      >
        {prefix}-{options.to}
      </Link>
    {/each}
  </svelte:element>
{/snippet}

<HeadContent />
{@render Nav('header')}
<hr />
<Outlet />
<hr />
{@render Nav('footer')}
<TanStackRouterDevtools position="bottom-right" />
