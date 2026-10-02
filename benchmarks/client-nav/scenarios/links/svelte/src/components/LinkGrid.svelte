<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
  import { itemIds, stepItemIds, variantSearch } from '../../../shared'
</script>

<div>
  {#each itemIds as id (id)}
    <div>
      <Link
        to="/items/$id"
        params={{ id }}
        data-testid={stepItemIds.includes(id) ? `go-item-${id}` : undefined}
      >
        {`Item ${id}`}
      </Link>
      <Link
        to="/items/$id"
        params={{ id }}
        activeOptions={{ exact: true }}
        activeProps={{ class: 'active-link' }}
        inactiveProps={{ class: 'inactive-link' }}
      >
        {`Item ${id} exact`}
      </Link>
      <Link
        to="/items/$id"
        params={{ id }}
        search={variantSearch}
        activeOptions={{ includeSearch: false }}
      >
        {`Item ${id} search`}
      </Link>
      <Link to="/items/$id" params={{ id }} hash={`section-${id}`}>
        {`Item ${id} hash`}
      </Link>
      <Link to="/items/$id" params={{ id }} activeOptions={{ exact: true }}>
        {#snippet children({ isActive })}
          {isActive ? `Item ${id} on` : `Item ${id} off`}
        {/snippet}
      </Link>
    </div>
  {/each}
</div>
