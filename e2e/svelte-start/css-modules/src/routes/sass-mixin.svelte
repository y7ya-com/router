<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import '~/styles/app.scss'

  export const Route = createFileRoute('/sass-mixin')()
</script>

<div>
  <h1>CSS Collection Test - Sass Mixin</h1>
  <p>
    This page tests that Sass mixins imported in a parent file are available to
    subsequent imports during dev mode SSR.
  </p>

  <div class="mixin-container" data-testid="mixin-styled">
    <span data-testid="mixin-content">
      Sass Mixin Applied - Should be centered with purple background
    </span>
  </div>
</div>
