<script lang="ts">
  import { Link, linkOptions } from '@tanstack/svelte-router'

  let { type }: { type: 'header' | 'footer' } = $props()

  const prefix = $derived(type === 'header' ? 'Head' : 'Foot')
  const optionsList = $derived([
    linkOptions({ to: '/normal-page' }),
    linkOptions({ to: '/with-loader' }),
    linkOptions({ to: '/with-search', search: { where: type } }),
  ] as const)
</script>

{#snippet content()}
  <Link
    to="/"
    activeProps={{
      class: 'font-bold',
    }}
    activeOptions={{ exact: true }}
  >
    {prefix}-/
  </Link>{' '}
  {#each optionsList as options, i (i)}
    <Link
      {...options}
      activeProps={{
        class: 'font-bold',
      }}
    >
      {prefix}-{options.to}
    </Link>
  {/each}
{/snippet}

{#if type === 'header'}
  <header class="p-2 flex gap-2 text-lg">{@render content()}</header>
{:else}
  <footer class="p-2 flex gap-2 text-lg">{@render content()}</footer>
{/if}
