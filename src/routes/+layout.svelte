<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import Footer from '$lib/components/common/Footer.svelte';
	import Header from '$lib/components/menu/Header.svelte';
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
	import PWAUpdatePrompt from '$lib/components/common/PWAUpdatePrompt.svelte';
	import NetworkStatusIndicator from '$lib/components/atoms/NetworkStatusIndicator.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { getGlobalState } from '$lib/stores/globalState.svelte';
	import {
		initPerformanceMonitoring,
		assessConnectionQuality
	} from '$lib/utils/performanceMonitor';
	import { registerIcons } from '$lib/icons';
	import { useGtm } from '$lib/utils/gtm.svelte';
	import { useNetworkMonitor } from '$lib/utils/networkMonitor.svelte';
	import { useJsonLdScript } from '$lib/utils/jsonLd.svelte';

	// Register all icons at app startup to avoid API calls
	registerIcons();

	// Destructure children and data from $props using LayoutProps
	let { children, data }: LayoutProps = $props();

	// Get access to global state
	const globalState = getGlobalState();

	// Global JSON-LD for WebSite and Person schemas
	const globalJsonLd = $derived((data as { globalJsonLd?: string })?.globalJsonLd ?? '');
	useJsonLdScript('global-json-ld', () => globalJsonLd);

	// Monitor network status
	useNetworkMonitor();

	// Initialize performance monitoring
	$effect(() => {
		if (browser) {
			initPerformanceMonitoring();

			// Assess connection quality on load
			setTimeout(() => {
				const connectionQuality = assessConnectionQuality();
				console.log(`[PWA] Connection quality: ${connectionQuality}`);
			}, 1000);
		}
	});

	// Initialize GTM with lazy loading
	const GTM_ID = 'G-DQ644SW7RG';
	const { trackPageView } = useGtm(GTM_ID);

	let isTransitioning = $state(false);

	afterNavigate(() => {
		// Set transitioning state
		isTransitioning = true;

		// Use the global state method to temporarily disable animations
		globalState.temporarilyDisableAnimations(100);

		// Remove transition state after page settles
		setTimeout(() => {
			isTransitioning = false;
		}, 100);

		// Track page views with Google Analytics
		trackPageView();
	});
</script>

<div class="layout-container" class:page-transitioning={isTransitioning}>
	<Header />

	<main class="main-content-area">
		<div class="container py-6 md:py-10">
			{#key $page.url}
				<div>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	<Footer />
	<CookieConsent />
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
