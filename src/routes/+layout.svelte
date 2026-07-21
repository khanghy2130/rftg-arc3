<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
  <title>Card Gallery - Race for the Galaxy Arc 3</title>
</svelte:head>

{@render children()}
