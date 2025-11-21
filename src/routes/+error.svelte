<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Error {$page.status}</title>
</svelte:head>

<div class="container error-layout flex flex-col items-center justify-center py-12">
	<div class="glass-panel p-8 md:p-12 text-center max-w-2xl w-full flex flex-col items-center">
		<h1 class="text-4xl font-bold mb-6 text-primary">Oops! Something went wrong.</h1>
		{#if $page.status === 404}
			<h2 class="text-2xl font-semibold mb-4">Page Not Found</h2>
			<p class="mb-2 text-lg">Sorry, we couldn't find the page you were looking for.</p>
			<p class="mb-8 text-muted">
				The path <code>{$page.url.pathname}</code> does not exist.
			</p>
		{:else}
			<h2 class="text-2xl font-semibold mb-4">Error {$page.status}</h2>
			<p class="mb-8 text-lg">{$page.error?.message || 'An unexpected error occurred.'}</p>
		{/if}
		<a href="/" class="btn btn-primary"> Go to Homepage </a>
	</div>
</div>

<style>
	.error-layout {
		min-height: 60vh;
	}
</style>
