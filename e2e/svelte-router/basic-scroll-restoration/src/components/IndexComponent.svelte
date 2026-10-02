<script lang="ts">
  import { onMount } from 'svelte'

  onMount(() => {
    window.invokeOrders.push('index-useLayoutEffect')
  })
</script>

<div class="p-2">
  <h3 id="greeting" class="bg-red-600">Welcome Home!</h3>
  <div id="top-message"></div>
  <div class="space-y-2">
    {#each { length: 50 }, i}
      <div class="h-[100px] p-2 rounded-lg bg-gray-200 dark:bg-gray-800 border">
        Home Item {i + 1}
      </div>
    {/each}
  </div>
</div>
