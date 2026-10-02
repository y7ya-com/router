<script lang="ts">
  import { Link } from '@tanstack/svelte-router'

  let { salt }: { salt: number } = $props()

  const value = $derived(String((salt % 97) + 1))
</script>

<Link
  to="/$a/$b/$c/$d"
  params={{
    a: `a-${value}`,
    b: `b-${value}`,
    c: `c-${value}`,
    d: `d-${value}`,
  }}
  search={{ q: `q-${value}` }}
  preload={false}
>
  Link
</Link>
