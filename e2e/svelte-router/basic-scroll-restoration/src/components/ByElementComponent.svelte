<script lang="ts">
  import { onMount } from 'svelte'
  import { useElementScrollRestoration } from '@tanstack/svelte-router'
  import { createVirtualizer } from '@tanstack/svelte-virtual'

  // We need a unique ID for manual scroll restoration on a specific element
  // It should be as unique as possible for this element across your app
  const scrollRestorationId = 'myVirtualizedContent'

  // We use that ID to get the scroll entry for this element
  const scrollEntry = useElementScrollRestoration({
    id: scrollRestorationId,
  })

  // Let's use TanStack Virtual to virtualize some content!
  let virtualizerParentRef: HTMLDivElement | null = null
  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: 10000,
    getScrollElement: () => virtualizerParentRef,
    estimateSize: () => 100,
    // We pass the scrollY from the scroll restoration entry to the virtualizer
    // as the initial offset
    initialOffset: scrollEntry?.scrollY,
  })

  onMount(() => {
    $virtualizer._willUpdate()
  })
</script>

<div class="p-2 h-[calc(100vh-41px)] flex flex-col">
  <div>Hello from By-Element!</div>
  <div class="h-full min-h-0 flex gap-4">
    <div
      id="RegularList"
      class="border rounded-lg p-2 overflow-auto flex-1 space-y-2"
    >
      <div class="h-[100px] p-2 rounded-lg bg-red-600 border">
        First Regular List Item
        <div id="first-regular-list-item"></div>
      </div>
      {#each { length: 50 }, i}
        <div
          class="h-[100px] p-2 rounded-lg bg-gray-200 dark:bg-gray-800 border"
        >
          Regular List Item {i + 1}
        </div>
      {/each}
    </div>
    <div class="flex-1 overflow-auto flex flex-col gap-4">
      {#each { length: 2 }}
        <div class="flex-1 border rounded-lg p-2 overflow-auto">
          <div class="space-y-2">
            {#each { length: 50 }, i}
              <div
                class="h-[100px] p-2 rounded-lg bg-gray-200 dark:bg-gray-800 border"
              >
                About Item {i + 1}
              </div>
            {/each}
          </div>
        </div>
      {/each}
      <div class="flex-1 flex flex-col min-h-0">
        <div class="font-bold">Virtualized</div>
        <!-- We pass the scroll restoration ID to the element as a custom
             attribute that will get picked up by the scroll restoration
             watcher -->
        <div
          bind:this={virtualizerParentRef}
          data-scroll-restoration-id={scrollRestorationId}
          class="flex-1 border rounded-lg overflow-auto relative"
        >
          <div style:height="{$virtualizer.getTotalSize()}px">
            {#each $virtualizer.getVirtualItems() as item (item.key)}
              <div
                class="absolute p-2 pb-0 w-full"
                style:height="{item.size}px"
                style:top="{item.start}px"
              >
                <div
                  class="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 border h-full"
                >
                  Virtualized Item {item.index + 1}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
