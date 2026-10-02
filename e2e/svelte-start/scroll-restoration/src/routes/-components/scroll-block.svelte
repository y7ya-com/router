<script module lang="ts">
  export const atTheTopId = 'at-the-top'
  export const atTheBottomId = 'at-the-bottom'
</script>

<script lang="ts">
  let { number = 100 }: { number?: number } = $props()
</script>

<div id={atTheTopId} data-testid={atTheTopId}></div>
{#each Array.from({ length: number }) as _, i (i)}
  <div>{i}</div>
{/each}
<div id={atTheBottomId} data-testid={atTheBottomId}>At the bottom</div>
