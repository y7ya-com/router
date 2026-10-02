<script lang="ts">
  import SharedCard from '~/components/SharedCard.svelte'
  import styles from '~/styles/page-a.module.css'
</script>

<section class={styles.page} data-testid="page-a">
  <h1 class={styles.title}>Route /a</h1>
  <p>Route /a keeps the shared card styled.</p>
  <SharedCard label="from /a" />
</section>
