<script lang="ts">
  import { Route } from '../routes/deps.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useLoaderDeps({
    select: (deps) => computeChecksum(deps.page * 17),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
