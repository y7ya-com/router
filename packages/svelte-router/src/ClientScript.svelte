<script lang="ts">
  // Inserts an executable script on the client. Scripts added through
  // `{@html}` never run, so the element is created imperatively; a matching
  // script already in the document (e.g. server-rendered) is left alone.
  let { attrs, children }: { attrs?: Record<string, any>; children?: string } =
    $props()

  function createScript() {
    const script = document.createElement('script')
    for (const [key, value] of Object.entries(attrs ?? {})) {
      if (value !== undefined && value !== false && value !== null) {
        script.setAttribute(
          key,
          typeof value === 'boolean' ? '' : String(value),
        )
      }
    }
    return script
  }

  $effect(() => {
    let script: HTMLScriptElement
    if (typeof attrs?.src === 'string') {
      let src: string = attrs.src
      try {
        src = new URL(attrs.src, document.baseURI).href
      } catch {
        // keep the raw value
      }
      const exists = Array.from(
        document.querySelectorAll<HTMLScriptElement>('script[src]'),
      ).some((el) => el.src === src)
      if (exists) {
        return
      }
      script = createScript()
    } else if (typeof children === 'string') {
      const type = attrs?.type ?? 'text/javascript'
      const exists = Array.from(
        document.querySelectorAll('script:not([src])'),
      ).some(
        (el) =>
          el.textContent === children &&
          (el.getAttribute('type') ?? 'text/javascript') === type &&
          (el.getAttribute('nonce') ?? undefined) === attrs?.nonce,
      )
      if (exists) {
        return
      }
      script = createScript()
      script.textContent = children
    } else {
      return
    }
    document.head.appendChild(script)
    return () => script.remove()
  })
</script>
