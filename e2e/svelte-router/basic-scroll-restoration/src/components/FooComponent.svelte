<script lang="ts">
  import { Link } from '@tanstack/svelte-router'
</script>

<div data-testid="foo-route-component" class="p-2">
  <h3 id="greeting">Hello from Foo!</h3>
  <Link to="/bar" data-testid="go-to-bar-link">Go to Bar</Link>
  <div class="space-y-2">
    {#each { length: 50 }, i}
      <div class="h-[100px] p-2 rounded-lg bg-gray-200 dark:bg-gray-800 border">
        Foo Item {i + 1}
      </div>
    {/each}
  </div>
</div>
