<script lang="ts">
  let {
    textColor = 'gray',
  }: {
    /**
     * Accepts any valid CSS color value as a string.
     */
    textColor?: string
  } = $props()

  let count = $state(0)

  const countLabel = $derived.by(() => {
    if (count === 0) {
      return 'Click the logo!'
    }
    if (count === 1) {
      return '1 click'
    }
    return `${count} clicks`
  })

  function increment() {
    count++
  }

  function reset() {
    count = 0
  }
</script>

<div class="svelte-logo-container">
  <button
    type="button"
    class="logo-button"
    aria-label="Svelte logo"
    onclick={increment}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 98.1 118"
      class="svelte-logo"
    >
      <path
        d="M91.8 15.6C80.9-.1 59.2-4.7 43.6 5.2L16.1 22.8C8.6 27.5 3.4 35.2 1.9 43.9c-1.3 7.3-.2 14.8 3.3 21.3-2.4 3.6-4 7.6-4.7 11.8-1.6 8.9.5 18.1 5.7 25.4 11 15.7 32.6 20.3 48.2 10.4l27.5-17.5c7.5-4.7 12.7-12.4 14.2-21.1 1.3-7.3.2-14.8-3.3-21.3 2.4-3.6 4-7.6 4.7-11.8 1.7-9-.4-18.2-5.7-25.5"
        fill="#ff3e00"
      />
      <path
        d="M40.9 103.9c-8.9 2.3-18.2-1.2-23.4-8.7-3.2-4.4-4.4-9.9-3.5-15.3.2-.9.4-1.7.6-2.6l.5-1.6 1.4 1c3.3 2.4 6.9 4.2 10.8 5.4l1 .3-.1 1c-.1 1.4.3 2.9 1.1 4.1 1.6 2.3 4.4 3.4 7.1 2.7.6-.2 1.2-.4 1.7-.7L65.5 72c1.4-.9 2.3-2.2 2.6-3.8.3-1.6-.1-3.3-1-4.6-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7l-10.5 6.7c-1.7 1.1-3.6 1.9-5.6 2.4-8.9 2.3-18.2-1.2-23.4-8.7-3.1-4.4-4.4-9.9-3.4-15.3.9-5.2 4.1-9.9 8.6-12.7l27.5-17.5c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.2.9-.4 1.7-.7 2.6l-.5 1.6-1.4-1c-3.3-2.4-6.9-4.2-10.8-5.4l-1-.3.1-1c.1-1.4-.3-2.9-1.1-4.1-1.6-2.3-4.4-3.3-7.1-2.6-.6.2-1.2.4-1.7.7L32.4 46.1c-1.4.9-2.3 2.2-2.6 3.8s.1 3.3 1 4.6c1.6 2.3 4.4 3.3 7.1 2.6.6-.2 1.2-.4 1.7-.7l10.5-6.7c1.7-1.1 3.6-1.9 5.6-2.5 8.9-2.3 18.2 1.2 23.4 8.7 3.2 4.4 4.4 9.9 3.5 15.3-.9 5.2-4.1 9.9-8.6 12.7l-27.5 17.5c-1.7 1.1-3.6 1.9-5.6 2.5"
        fill="#fff"
      />
    </svg>
  </button>
  <p class="count-label" style:color={textColor}>
    {countLabel}
  </p>
  {#if count > 0}
    <button class="reset-btn" onclick={reset}>Reset</button>
  {/if}
</div>

<style>
  .svelte-logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .logo-button {
    background: none;
    border: none;
    padding: 0;
  }

  .svelte-logo {
    width: 64px;
    height: 64px;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .svelte-logo:hover {
    transform: scale(1.1);
  }

  .svelte-logo:active {
    transform: scale(0.95);
  }

  .count-label {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }

  .reset-btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    background: #ff3e00;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .reset-btn:hover {
    background: #40b3ff;
  }
</style>
