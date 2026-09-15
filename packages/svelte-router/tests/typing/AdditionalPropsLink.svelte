<script lang="ts">
  import { Link } from '../../src'

  let { additionalProps, ...rest }: { additionalProps: number } = $props()
</script>

<Link {...rest as any} data-additional={additionalProps} />
