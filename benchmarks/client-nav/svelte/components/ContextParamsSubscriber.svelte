<script lang="ts">
  import { contextRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const params = contextRoute.useParams({
    select: (params) => runPerfSelectorComputation(Number(params.id)),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(params.current)
  })
</script>
