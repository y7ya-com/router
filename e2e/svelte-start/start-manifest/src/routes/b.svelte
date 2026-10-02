<script lang="ts">
  import SharedCard from '~/components/SharedCard.svelte'
  import styles from '~/styles/page-b.module.css'
</script>

<section class={styles.page} data-testid="page-b">
  <h1 class={styles.title}>Route /b</h1>
  <p>Route /b should keep the shared card stylesheet after nav.</p>
  <SharedCard label="from /b" />
</section>
