<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { searchRoute } from '../routes'
  import { linkGroups } from '../perf'
</script>

{#each linkGroups as groupIndex (groupIndex)}
  {@const itemsId = groupIndex === 0 ? 1 : groupIndex + 2}
  {@const ctxId = groupIndex + 1}
  <div>
    <Link
      data-testid={groupIndex === 0 ? 'go-items-1' : undefined}
      to="/items/$id"
      params={{ id: itemsId }}
      replace
      activeOptions={{ exact: true }}
      activeProps={{ class: 'active-link' }}
      inactiveProps={{ class: 'inactive-link' }}
    >
      {`Items ${itemsId}`}
    </Link>
    <Link
      data-testid={groupIndex === 0 ? 'go-items-2' : undefined}
      to="/items/$id"
      params={{ id: 2 }}
      replace
      activeOptions={{ includeSearch: false }}
    >
      {`Items 2 alt ${groupIndex}`}
    </Link>
    <Link
      data-testid={groupIndex === 0 ? 'go-search' : undefined}
      to="/search"
      search={{ page: 1, filter: 'all', junk: `group-${groupIndex}` }}
      replace
      activeOptions={{ includeSearch: true }}
      activeProps={{ class: 'active-link' }}
      inactiveProps={{ class: 'inactive-link' }}
    >
      {`Search ${groupIndex}`}
    </Link>
    <Link
      data-testid={groupIndex === 0 ? 'go-ctx' : undefined}
      to="/ctx/$id"
      params={{ id: ctxId }}
      search={true}
      replace
      activeOptions={{ includeSearch: false }}
    >
      {`Context ${ctxId}`}
    </Link>
    <Link
      from={searchRoute.fullPath}
      to="/search"
      search={(prev: { page: number; filter: string }) => ({
        page: prev.page + groupIndex + 1,
        filter: prev.filter,
        junk: `updater-${groupIndex}`,
      })}
      activeOptions={{ includeSearch: true }}
    >
      {#snippet children({ isActive }: { isActive: boolean })}
        {isActive
          ? `Search updater active ${groupIndex}`
          : `Search updater inactive ${groupIndex}`}
      {/snippet}
    </Link>
  </div>
{/each}
