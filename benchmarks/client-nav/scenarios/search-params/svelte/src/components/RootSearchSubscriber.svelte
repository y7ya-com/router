<script lang="ts">
  import { useSearch } from '@tanstack/svelte-router'
  import { computeChecksum } from '../../../shared'

  const value = useSearch({
    strict: false,
    select: (search) => computeChecksum(Number(search.page ?? 0)),
  })

  $effect.pre(() => {
    void computeChecksum(value.current)
  })
</script>
