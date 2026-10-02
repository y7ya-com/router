<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'

  export const Route = createFileRoute('/specialChars/hash')({})
</script>

<script lang="ts">
  import { useLocation } from '@tanstack/svelte-router'

  const l = useLocation()
  let toggleHashValue = $state(false)

  const toggle = () => {
    toggleHashValue = !toggleHashValue
  }
</script>

<div data-testid="special-hash-heading">
  <div>Hello "/specialChars/hash"!</div>
  <button
    class={'mt-2 mb-2 px-1 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-200'}
    data-testid="toggle-hash-button"
    onclick={toggle}
  >
    Toggle HashValue
  </button>
  <div>
    {#if toggleHashValue}
      <div>
        Hash Value<span data-testid="special-hash">{l.current.hash}</span>
      </div>
    {/if}
  </div>
</div>
