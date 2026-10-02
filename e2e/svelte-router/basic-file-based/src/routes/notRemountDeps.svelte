<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/notRemountDeps')({
    validateSearch(search: { searchParam: string }) {
      return { searchParam: search.searchParam }
    },
    loaderDeps(opts) {
      return opts.search
    },
    remountDeps(opts) {
      return opts.params
    },
  })
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { useSearch, useNavigate } from '@tanstack/svelte-router'

  let mounts = $state(0)
  const search = useSearch({ from: '/notRemountDeps' })
  const navigate = useNavigate()

  onMount(() => {
    mounts++
  })
</script>

<div class="p-2">
  <button
    onclick={() =>
      navigate({
        to: '/notRemountDeps',
        search: { searchParam: Math.random().toString(36).substring(2, 8) },
      })}
  >
    Regenerate search param
  </button>

  <div>Search: {search.current.searchParam}</div>
  <div data-testid="component-mounts">
    Page component mounts: {mounts}
  </div>
</div>
