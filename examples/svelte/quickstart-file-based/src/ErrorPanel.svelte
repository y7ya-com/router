<script lang="ts">
  let { error }: { error: unknown } = $props()
</script>

<div class="page">
  <h1>Something went wrong</h1>
  <p>An error bubbled up from a route render or loader.</p>
  <pre>{error instanceof Error
    ? error.stack ?? error.message
    : JSON.stringify(error, null, 2)}</pre>
</div>

<style>
  .page {
    padding: 1.5rem;
    max-width: 720px;
    color: #4b5563;
    line-height: 1.5;
  }
  h1 {
    margin-top: 0;
    color: #b91c1c;
  }
  pre {
    background: #fef2f2;
    color: #991b1b;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    border: 1px solid #fecaca;
    overflow: auto;
    font-size: 0.85rem;
  }
</style>
