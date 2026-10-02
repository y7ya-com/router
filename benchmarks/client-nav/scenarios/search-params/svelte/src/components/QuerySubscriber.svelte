<script lang="ts">
  import { Route } from '../routes/products.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useSearch({
    select: (search) =>
      computeChecksum(search.q.length * 13 + search.sort.length),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
