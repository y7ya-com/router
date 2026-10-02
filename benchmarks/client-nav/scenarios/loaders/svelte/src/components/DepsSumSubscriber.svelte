<script lang="ts">
  import { Route } from '../routes/deps.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useLoaderData({
    select: (data) => computeChecksum(data.checksum),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
