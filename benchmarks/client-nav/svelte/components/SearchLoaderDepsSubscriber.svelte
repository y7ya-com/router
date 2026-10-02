<script lang="ts">
  import { searchRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const loaderDeps = searchRoute.useLoaderDeps({
    select: (loaderDeps) =>
      runPerfSelectorComputation(loaderDeps.page + loaderDeps.filter.length),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(loaderDeps.current)
  })
</script>
