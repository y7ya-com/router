<script
  lang="ts"
  generics="TRouter extends AnyRouter = RegisteredRouter, TFrom extends string = string, TTo extends string | undefined = undefined, TMaskFrom extends string = TFrom, TMaskTo extends string = ''"
>
  import { onMount } from 'svelte'
  import { useRouter } from './useRouter'
  import type {
    AnyRouter,
    NavigateOptions,
    RegisteredRouter,
  } from '@tanstack/router-core'

  let props: NavigateOptions<TRouter, TFrom, TTo, TMaskFrom, TMaskTo> = $props()

  const { navigate } = useRouter()

  onMount(() => {
    navigate({ ...props })
  })
</script>
