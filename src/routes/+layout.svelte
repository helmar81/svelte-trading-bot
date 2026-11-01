<script lang="ts">
    import { onMount } from 'svelte';
    import '../app.css';

    let { children } = $props();
    const viteEnv = import.meta as ImportMeta & { env?: { DEV?: boolean } };

    onMount(() => {
        // Only register service worker in production to avoid dev server caching issues
        if (!viteEnv.env?.DEV && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/service-worker.js')
                .catch((error) => console.error('Service worker registration failed:', error));
        }
    });
</script>

<svelte:head>
    <link rel="icon" type="image/png" href="/icon-192.png" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
</svelte:head>

{@render children()}