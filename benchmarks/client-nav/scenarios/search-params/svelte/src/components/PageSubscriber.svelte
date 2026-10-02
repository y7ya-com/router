<script lang="ts">
  import { Route } from '../routes/products.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useSearch({
    select: (search) => computeChecksum(search.page * 31 + search.perPage),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
