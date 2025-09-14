<script lang="ts">
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Navigation from '$lib/components/navigation.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-background">
  <Navigation />
  <main class="mx-auto max-w-6xl px-4 py-8">
    {@render children?.()}
  </main>
</div>
