<script lang="ts">
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	import Footer from '$lib/components/organisms/Footer.svelte';
	import Header from '$lib/components/organisms/Header.svelte';
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
	import '../app.css';
</script>

<div class="site-container">
	<Header />

	<main class="site-main">
		<div class="container mx-auto p-8">
			{#key $page.url}
				<div>
					<slot />
				</div>
			{/key}
		</div>
	</main>

	<Footer />
	<CookieConsent />
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
