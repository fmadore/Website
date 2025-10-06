<script lang="ts">
	/// <reference types="../lib/types/gtag" />
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { afterNavigate } from '$app/navigation';
	import Footer from '$lib/components/common/Footer.svelte';
	import Header from '$lib/components/menu/Header.svelte';
	import CookieConsent from '$lib/components/common/CookieConsent.svelte';
	import PWAUpdatePrompt from '$lib/components/common/PWAUpdatePrompt.svelte';
	import NetworkStatusIndicator from '$lib/components/common/NetworkStatusIndicator.svelte';
	import '../app.css';
	import type { LayoutProps } from './$types';
	import { getGlobalState } from '$lib/stores/globalState.svelte';
	import {
		initPerformanceMonitoring,
		assessConnectionQuality
	} from '$lib/utils/performanceMonitor';

	// Destructure children from $props using LayoutProps
	let { children }: LayoutProps = $props();

	// Get access to global state
	const globalState = getGlobalState();

	// Monitor network status
	$effect(() => {
		if (browser) {
			// Set initial online status
			globalState.isOnline = navigator.onLine;

			// Listen for online/offline events
			const handleOnline = () => {
				globalState.isOnline = true;
				console.log('[PWA] Connection restored');
			};

			const handleOffline = () => {
				globalState.isOnline = false;
				console.log('[PWA] Connection lost - offline mode active');
			};

			// Prevent install prompts completely - no UI shown to user
			const preventInstallPrompt = (e: Event) => {
				e.preventDefault();
				// Just prevent it, don't store or show anything to user
			};

			window.addEventListener('online', handleOnline);
			window.addEventListener('offline', handleOffline);
			window.addEventListener('beforeinstallprompt', preventInstallPrompt);

			return () => {
				window.removeEventListener('online', handleOnline);
				window.removeEventListener('offline', handleOffline);
				window.removeEventListener('beforeinstallprompt', preventInstallPrompt);
			};
		}
	});

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

	let gtmLoaded = $state(false);
	let isTransitioning = $state(false);
	const GTM_ID = 'G-DQ644SW7RG'; // Your Measurement ID
	const isDebugMode = false; // Set to true for development debugging

	function loadGtm() {
		if (gtmLoaded || !browser) return;
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

		// Check consent and localhost status
		const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
		const isLocalhost =
			window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

		window.gtag('config', GTM_ID, {
			// Disable automatic page view tracking to prevent conflicts with SvelteKit
			send_page_view: false,
			// Enable enhanced measurement for SPAs
			allow_enhanced_conversions: true,
			// Anonymize IP addresses for privacy compliance
			anonymize_ip: true,
			// Additional SPA-specific configurations
			transport_type: 'beacon',
			// Enable debug mode if needed (for development)
			debug_mode: isDebugMode,
			custom_map: {}
		});

		// Send initial page view manually if consent is given and not localhost
		if (!isLocalhost && cookiesAccepted) {
			try {
				window.gtag('event', 'page_view', {
					page_title: document.title,
					page_location: window.location.href,
					page_path: window.location.pathname
				});
			} catch (error) {
				console.warn('Failed to send initial page view to Google Analytics:', error);
			}
		}

		// Clean up interaction listeners
		window.removeEventListener('scroll', loadGtmListener);
		window.removeEventListener('mousemove', loadGtmListener);
		window.removeEventListener('touchstart', loadGtmListener);
		if (loadGtmTimer) clearTimeout(loadGtmTimer);
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
		// Set transitioning state
		isTransitioning = true;

		// Use the new global state method to temporarily disable animations
		globalState.temporarilyDisableAnimations(100);

		// Remove transition state after page settles
		setTimeout(() => {
			isTransitioning = false;
		}, 100);

		// Track page views with Google Analytics (SvelteKit-compatible)
		if (browser && gtmLoaded && typeof window.gtag === 'function') {
			const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
			const isLocalhost =
				window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

			if (!isLocalhost && cookiesAccepted) {
				// Send manual page view event as recommended for SPAs
				try {
					window.gtag('event', 'page_view', {
						page_title: document.title,
						page_location: window.location.href,
						page_path: window.location.pathname
					});
				} catch (error) {
					console.warn('Failed to send page view to Google Analytics:', error);
				}
			}
		}
	});
</script>

<div class="layout-container" class:page-transitioning={isTransitioning}>
	<Header />

	<main class="main-content-area">
		<div class="container mx-auto p-4 md:p-8">
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

	.container {
		max-width: var(--container-xl);
		margin-left: auto;
		margin-right: auto;
	}

	.main-content-area {
		flex-grow: 1;
	}
</style>
