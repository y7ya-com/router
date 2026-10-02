<script lang="ts">
  import {
    ErrorComponent,
    Link,
    useLocation,
    useRouter,
  } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let { error, reset }: ErrorComponentProps = $props()

  const router = useRouter()
  const isRoot = useLocation({
    select: (location) => location.pathname === '/',
  })

  $effect(() => {
    console.error(error)
  })
</script>

<div class="min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
  <ErrorComponent {error} {reset} />
  <div class="flex gap-2 items-center flex-wrap">
    <button
      onclick={() => {
        router.invalidate()
      }}
      class="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold"
    >
      Try Again
    </button>
    {#if isRoot.current}
      <Link
        to="/"
        class="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold"
      >
        Home
      </Link>
    {:else}
      <Link
        to="/"
        class="px-2 py-1 bg-gray-600 dark:bg-gray-700 rounded-sm text-white uppercase font-extrabold"
        onclick={(e: MouseEvent) => {
          e.preventDefault()
          window.history.back()
        }}
      >
        Go Back
      </Link>
    {/if}
  </div>
</div>
