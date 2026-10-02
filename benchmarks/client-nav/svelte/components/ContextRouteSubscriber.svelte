<script lang="ts">
  import { contextRoute } from '../routes'
  import { runPerfSelectorComputation } from '../perf'

  const context = contextRoute.useRouteContext({
    select: (context) => runPerfSelectorComputation(context.sectionSeed),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(context.current)
  })
</script>
