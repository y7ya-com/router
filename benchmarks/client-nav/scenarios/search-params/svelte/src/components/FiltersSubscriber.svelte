<script lang="ts">
  import { Route } from '../routes/products.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useSearch({
    select: (search) =>
      computeChecksum(
        search.filters.categories.length * 7 +
          (search.filters.price.max - search.filters.price.min) +
          search.filters.tags.length * 3,
      ),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
