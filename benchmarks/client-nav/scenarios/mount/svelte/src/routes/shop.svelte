<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import { shopContext } from '../../../shared'

  export const Route = createFileRoute('/shop')({
    beforeLoad: () => shopContext(),
  })
</script>

<script lang="ts">
  import { Outlet } from '@tanstack/svelte-router'
</script>

<section>
  <h2>Shop</h2>
  <Outlet />
</section>
