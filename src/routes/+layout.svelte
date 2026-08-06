<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { motionDuration } from '$lib/utils/motion';
	import Footer from '$lib/components/common/Footer.svelte';
	import Header from '$lib/components/menu/Header.svelte';
	import PWAUpdatePrompt from '$lib/components/common/PWAUpdatePrompt.svelte';
	import NetworkStatusIndicator from '$lib/components/atoms/NetworkStatusIndicator.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { registerIcons } from '$lib/icons';
	import { useGtm } from '$lib/utils/gtm.svelte';
	import { useNetworkMonitor } from '$lib/utils/networkMonitor.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';

	// Register all icons at app startup to avoid API calls
	registerIcons();

	// Destructure children and data from $props using LayoutProps
	let { children, data }: LayoutProps = $props();

	// Global JSON-LD for WebSite and Person schemas
	const globalJsonLd = $derived((data as { globalJsonLd?: string })?.globalJsonLd ?? '');

	// Monitor network status
	useNetworkMonitor();

	// WebMCP is experimental and uncommon. Keep its implementation out of the
	// shared entry chunk and load it only in browsers that expose the API.
	$effect(() => {
		if (!browser || !('modelContext' in navigator)) return;

		let disposed = false;
		let unregister = () => {};
		void import('$lib/utils/webmcp.svelte').then(({ registerWebMcp }) => {
			if (disposed) return;
			unregister = registerWebMcp();
		});

		return () => {
			disposed = true;
			unregister();
		};
	});

	// Initialize GTM with lazy loading
	const GTM_ID = 'G-DQ644SW7RG';
	const { trackPageView } = useGtm(GTM_ID);

	afterNavigate(() => {
		trackPageView();
	});
</script>

<JsonLd id="global-json-ld" json={globalJsonLd} />

<div class="layout-container">
	<Header />

	<main class="main-content-area">
		<div class="container py-6 md:py-10">
			<!-- Enter-only fade. An `out:` transition here kept the outgoing branch
			     alive waiting for an outro that never completed — the snippet inside
			     it is owned by the router, which had already swapped in the next
			     page — so every client-side navigation leaked a whole page's DOM and
			     left its <svelte:head> content (canonical, og:url, JSON-LD) behind on
			     top of the new page's. Without it the branch is torn down at once.
			     The brief asks for a fade on page *enter* only, so nothing is lost. -->
			{#key page.url.pathname}
				<div
					class="route-transition-root"
					in:fade={{ duration: motionDuration(180), delay: motionDuration(30), easing: cubicOut }}
				>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	<Footer />
	<PWAUpdatePrompt />
	<NetworkStatusIndicator />
</div>

<style>
	.layout-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.main-content-area {
		flex-grow: 1;
		/* Ensure main content (including sidebar dropdowns) appears above footer */
		position: relative;
		z-index: 2;
	}
</style>
