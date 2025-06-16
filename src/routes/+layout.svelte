<script lang="ts">
	/// <reference types="../lib/types/gtag" />
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Footer from '$lib/components/common/Footer.svelte';
	import Header from '$lib/components/menu/Header.svelte';
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types'; // Added import for LayoutProps
	import { afterNavigate } from '$app/navigation';
	import { animationsEnabled } from '$lib/stores/animationControl';

	// Destructure data and children from $props using LayoutProps
	// This makes `children` available to TypeScript for the {@render children()} tag
	let { data, children }: LayoutProps = $props();

	let gtmLoaded = $state(false);
	const GTM_ID = 'G-DQ644SW7RG'; // Your Measurement ID

	function loadGtm() {
		if (gtmLoaded || !browser) return;
		// Directly set gtmLoaded to true.
		// In Svelte 5, direct assignment to a $state variable triggers reactivity.
		gtmLoaded = true;

		// Inject the GTM script tag with proper error handling
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
		script.onerror = () => console.warn('Failed to load Google Analytics');
		document.head.appendChild(script);

		// Initialize dataLayer and gtag function
		window.dataLayer = window.dataLayer || [];
		window.gtag =
			window.gtag ||
			function () {
				window.dataLayer.push(arguments);
			};

		window.gtag('js', new Date());

		// Replicate initial config logic from app.html
		const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
		const isLocalhost =
			window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

		window.gtag('config', GTM_ID, {
			// Set initial page view sending based on consent/localhost
			send_page_view: !isLocalhost && cookiesAccepted,
			anonymize_ip: true,
			// Prevent any potential document.write usage
			custom_map: {},
			page_title: document.title,
			page_location: window.location.href
		});

		// Clean up interaction listeners
		window.removeEventListener('scroll', loadGtmListener);
		window.removeEventListener('mousemove', loadGtmListener);
		window.removeEventListener('touchstart', loadGtmListener);
		if (loadGtmTimer) clearTimeout(loadGtmTimer); // Clear timeout if interaction happened first
		console.log('GTM loaded.');
	}

	// Wrapper for event listeners
	const loadGtmListener = () => loadGtm();
	let loadGtmTimer: ReturnType<typeof setTimeout> | null = null; // Timer handle

	$effect(() => {
		if (browser && !gtmLoaded) {
			// Listen for first interaction
			const listenerOptions = { passive: true, once: true };
			window.addEventListener('scroll', loadGtmListener, listenerOptions);
			window.addEventListener('mousemove', loadGtmListener, listenerOptions);
			window.addEventListener('touchstart', loadGtmListener, listenerOptions);

			// Fallback: Load GTM after 5 seconds if no interaction occurs
			loadGtmTimer = setTimeout(loadGtm, 5000);

			// Cleanup function
			return () => {
				window.removeEventListener('scroll', loadGtmListener);
				window.removeEventListener('mousemove', loadGtmListener);
				window.removeEventListener('touchstart', loadGtmListener);
				if (loadGtmTimer) clearTimeout(loadGtmTimer);
			};
		}
		// Return an empty cleanup function if not in browser or already loaded
		return () => {};
	});

	afterNavigate(() => {
		animationsEnabled.set(true);
	});
</script>

<div class="layout-container">
	<Header />

	<main class="main-content-area">
		<div class="container mx-auto p-8">
			{#key $page.url}
				<div>
					{@render children()}
				</div>
			{/key}
		</div>
	</main>

	<Footer />
	<CookieConsent />
</div>

<style>
	.layout-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.container {
		max-width: 1280px;
		margin-left: auto;
		margin-right: auto;
	}

	.main-content-area {
		flex-grow: 1;
	}
</style>
