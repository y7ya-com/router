<script lang="ts">
  import type { ErrorComponentProps } from '@tanstack/router-core'

  let { error }: ErrorComponentProps = $props()

  let show = $state(process.env.NODE_ENV !== 'production')
</script>

<div style="padding: .5rem; max-width: 100%;">
  <div style="display: flex; align-items: center; gap: .5rem;">
    <strong style="font-size: 1rem;">Something went wrong!</strong>
    <button
      type="button"
      onclick={() => { show = !show }}
      style="background-color: rgba(0,0,0,.1); border-radius: .25rem; padding: .125rem .25rem; font-size: .75rem;"
    >
      {show ? 'Hide Error' : 'Show Error'}
    </button>
  </div>
  <div style="height: .25rem;"></div>
  {#if show}
    <div>
      <pre style="font-size: .75rem; border: 1px solid rgba(127,127,127,.25); border-radius: .25rem; padding: .25rem; color: red; overflow: auto;">{(error as Error)?.message}</pre>
    </div>
  {/if}
</div>
