<script lang="ts">
  import { useSearch } from '@tanstack/svelte-router'
  import { runSelectorWork } from './selector-work'

  let { salt }: { salt: number } = $props()

  const search = useSearch({
    strict: false,
    select: (nextSearch) => runSelectorWork(String(nextSearch.q ?? ''), salt),
  })

  void search.current
</script>
