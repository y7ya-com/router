<script lang="ts">
  import { useParams } from '@tanstack/svelte-router'
  import { runPerfSelectorComputation } from '../perf'

  const params = useParams({
    strict: false,
    select: (params) => runPerfSelectorComputation(Number(params.id ?? 0)),
  })

  $effect.pre(() => {
    void runPerfSelectorComputation(params.current)
  })
</script>
