<script lang="ts">
  import { Route } from '../routes/catalog.svelte'
  import { computeChecksum } from '../../../shared'

  const value = Route.useSearch({
    select: (search) =>
      computeChecksum(search.view.length * 5 + search.page * 11),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
