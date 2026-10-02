<script lang="ts">
  import { useParams } from '@tanstack/svelte-router'
  import { runSelectorWork } from './selector-work'

  let { salt }: { salt: number } = $props()

  const params = useParams({
    strict: false,
    select: (nextParams) =>
      runSelectorWork(
        `${nextParams.a ?? ''}/${nextParams.b ?? ''}/${nextParams.c ?? ''}/${nextParams.d ?? ''}`,
        salt,
      ),
  })

  void params.current
</script>
