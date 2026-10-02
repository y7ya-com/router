<script module lang="ts">
  import { createFileRoute } from '@tanstack/svelte-router'
  import styles from '~/styles/card.module.css'

  export const Route = createFileRoute('/modules')()
</script>

<div>
  <h1>CSS Collection Test - CSS Modules</h1>
  <p>This page tests that CSS modules are collected and served during SSR.</p>

  <div class={styles.card} data-testid="module-card">
    <div class={styles.title} data-testid="module-title">
      CSS Module Applied
    </div>
    <div class={styles.content} data-testid="module-content">
      This card should have a green theme with scoped class names even with
      JavaScript disabled.
    </div>
  </div>
</div>
