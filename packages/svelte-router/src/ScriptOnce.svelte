<script lang="ts">
  import { isServer } from '@tanstack/router-core/isServer'
  import { useRouter } from './useRouter.js'

  // `children` is the script source as a string, passed as a prop
  // (`<ScriptOnce children={code} />`), matching the React/Solid signature.
  type Props = {
    children: string
    log?: boolean
    sync?: boolean
  }

  let { children }: Props = $props()

  const router = useRouter()
  const nonce = router.options.ssr?.nonce

  // Server-only, like the other ports: the script runs once during hydration
  // and removes itself. A literal script element can't appear in a Svelte
  // template, so the tag is serialized (see Scripts.svelte for the same
  // pattern). The source is author-supplied, never user input.
  const html = $derived(
    (isServer ?? router.isServer)
      ? `<${'script'} class="$tsr"${nonce ? ` nonce="${nonce}"` : ''}>${children};document.currentScript.remove()</${'script'}>`
      : '',
  )
</script>

{#if html}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
{/if}
