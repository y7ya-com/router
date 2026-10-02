<script lang="ts">
  import { searchRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const search = searchRoute.useSearch({
    select: (search) =>
      runPerfSelectorComputation(search.page + search.filter.length),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(search.current)
  })
</script>
