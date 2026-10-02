<script lang="ts">
  import { ErrorComponent } from '@tanstack/svelte-router'
  import type { ErrorComponentProps } from '@tanstack/svelte-router'

  let props: ErrorComponentProps = $props()
</script>

<ErrorComponent {...props} />
