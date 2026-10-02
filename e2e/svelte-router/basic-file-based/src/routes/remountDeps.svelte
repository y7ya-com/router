<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/remountDeps')({
    validateSearch(search: { searchParam: string }) {
      return { searchParam: search.searchParam }
    },
    loaderDeps(opts) {
      return opts.search
    },
    remountDeps(opts) {
      return opts.search
    },
  })

  // Module-scoped state to persist across component remounts
  let mounts = $state(0)
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { useSearch, useNavigate } from '@tanstack/svelte-router'

  const search = useSearch({ from: '/remountDeps' })
  const navigate = useNavigate()

  onMount(() => {
    mounts++
  })
</script>

<div class="p-2">
  <button
    onclick={() =>
      navigate({
        to: '/remountDeps',
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
