<script lang="ts">
  import { Route } from '../routes/fresh.$id.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useLoaderData({
    select: (data) => computeChecksum(data.checksum),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
