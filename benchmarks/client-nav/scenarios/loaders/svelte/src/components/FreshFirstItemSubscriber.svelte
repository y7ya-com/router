<script lang="ts">
  import { Route } from '../routes/fresh.$id.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useLoaderData({
    select: (data) => computeChecksum(data.items[0]?.value ?? 0),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
