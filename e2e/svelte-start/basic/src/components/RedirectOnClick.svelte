<script lang="ts">
  import { useServerFn } from '@tanstack/svelte-start'
  import { throwRedirect } from './throwRedirect'

  let {
    target,
    reloadDocument,
    externalHost,
  }: {
    target: 'internal' | 'external'
    reloadDocument?: boolean
    externalHost?: string
  } = $props()

  const execute = useServerFn(throwRedirect)
</script>

<button
  data-testid="redirect-on-click"
  onclick={() =>
    execute({
      data: {
        target,
        reloadDocument,
        externalHost,
      },
    })}
>
  click me
</button>
