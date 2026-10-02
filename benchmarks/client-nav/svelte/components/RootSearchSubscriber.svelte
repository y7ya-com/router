<script lang="ts">
  import { useSearch } from '@tanstack/svelte-router'
  import { runPerfSelectorComputation } from '../perf'

  const search = useSearch({
    strict: false,
    select: (search) => runPerfSelectorComputation(Number(search.page ?? 0)),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(search.current)
  })
</script>
