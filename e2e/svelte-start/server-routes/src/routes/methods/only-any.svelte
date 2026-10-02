<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/methods/only-any')({
    ssr: false,
  })
</script>

<script lang="ts">
  import OnlyAnyTest, { HttpMethods } from '~/components/OnlyAnyTest.svelte'
</script>

<div class="p-2 m-2 grid gap-2" data-testid="route-component">
  <h3>Server Route has only ANY handler</h3>
  {#each HttpMethods as method (method)}
    <OnlyAnyTest {method} />
  {/each}
</div>
