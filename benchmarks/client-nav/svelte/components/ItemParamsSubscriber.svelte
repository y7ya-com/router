<script lang="ts">
  import { itemsRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const params = itemsRoute.useParams({
    select: (params) => runPerfSelectorComputation(params.id),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(params.current)
  })
</script>
