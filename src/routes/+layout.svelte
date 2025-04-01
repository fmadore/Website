<script lang="ts">
	import '../app.css';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import SpaRedirectHandler from '$lib/SpaRedirectHandler.svelte';
</script>

<SpaRedirectHandler />

<div class="site-container">
	<Header />

	<main class="site-main">
		<div class="container mx-auto p-8">
			<slot />
		</div>
	</main>

	<Footer />
</div>

<style>
	.site-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	
	.container {
		max-width: 1280px;
		margin-left: auto;
		margin-right: auto;
	}
	
	.site-main {
		flex-grow: 1;
	}
</style>
