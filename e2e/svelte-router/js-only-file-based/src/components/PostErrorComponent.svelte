<script>
  import { ErrorComponent } from '@tanstack/svelte-router'

  let { error, reset, info } = $props()
</script>

<ErrorComponent {error} {reset} {info} />
