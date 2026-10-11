<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/icon-192.png" />
	<link rel="apple-touch-icon" href="/icon-192.png" />
</svelte:head>

{@render children()}
