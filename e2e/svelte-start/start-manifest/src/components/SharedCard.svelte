<script lang="ts">
  import styles from '~/styles/shared-card.module.css'

  let { label }: { label: string } = $props()
</script>

<div class={styles.card} data-testid="shared-card">
  Shared card {label}
</div>
