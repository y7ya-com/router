<script lang="ts">
  // An `errorComponent` receives `{ error, info }`. This renders server-side
  // when a route loader throws a real error (see `/boom`).
  let { error }: { error: Error; info?: unknown } = $props()
</script>

<div class="error">
  <h2>Something went wrong</h2>
  <pre>{error?.message ?? String(error)}</pre>
</div>

<style>
  .error {
    padding: 0.75rem 1rem;
    border: 1px solid #fca5a5;
    background: #fef2f2;
    border-radius: 6px;
  }
  pre {
    margin: 0.25rem 0 0;
    white-space: pre-wrap;
  }
</style>
