<script lang="ts">
  let status = $state<'pending' | 'hydrated'>('pending')
</script>

<div
  data-testid="hydration-check"
  style:padding="8px"
  style:background-color={status === 'hydrated' ? '#d4edda' : '#f8f9fa'}
  style:border-bottom="1px solid #ccc"
>
  <button
    data-testid="hydration-check-btn"
    onclick={() => {
      status = 'hydrated'
    }}
  >
    {status === 'pending' ? 'Check Hydration' : 'Hydrated!'}
  </button>
  <span data-testid="hydration-status" style:margin-left="10px">
    {status}
  </span>
</div>
