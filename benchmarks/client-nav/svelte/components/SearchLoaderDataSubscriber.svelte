<script lang="ts">
  import { searchRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const loaderData = searchRoute.useLoaderData({
    select: (loaderData) =>
      runPerfSelectorComputation(loaderData.seed + loaderData.checksum),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(loaderData.current)
  })
</script>
