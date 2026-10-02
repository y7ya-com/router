<script lang="ts">
  let { use }: { use: () => { readonly current: unknown } } = $props()

  // The hook runs once, during this component's init, like any other hook.
  // svelte-ignore state_referenced_locally
  const value = use()

  $effect.pre(() => {
    void value.current
  })
</script>
