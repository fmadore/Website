/// <reference types="../types/gtag" />
/**
 * Google Tag Manager (GTM) utility for SvelteKit.
 *
 * Encapsulates lazy-loading of the GTM script, initial configuration,
 * and SPA-friendly page view tracking via afterNavigate.
 */

import { browser } from '$app/environment';

interface GtmState {
	loaded: boolean;
	timer: ReturnType<typeof setTimeout> | null;
	listener: () => void;
}

/**
 * Initializes GTM with lazy loading (on first interaction or after 5s fallback).
 * Returns a `trackPageView` function for use in afterNavigate.
 */
export function useGtm(gtmId: string, isDebugMode = false) {
	const state: GtmState = {
		loaded: false,
		timer: null,
		listener: () => loadGtm()
	};

	function loadGtm() {
		if (state.loaded || !browser) return;
		state.loaded = true;

		// Inject the GTM script tag
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${gtmId}`;
		script.onerror = () => console.warn('Failed to load Google Analytics');
		document.head.appendChild(script);

		// Initialize dataLayer and gtag function
		window.dataLayer = window.dataLayer ?? [];
		window.gtag =
			window.gtag ??
			function () {
				window.dataLayer!.push(arguments);
			};

		window.gtag!('js', new Date());

		// Check consent and localhost status
		const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
		const isLocalhost =
			window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

		window.gtag!('config', gtmId, {
			send_page_view: false,
			allow_enhanced_conversions: true,
			anonymize_ip: true,
			transport_type: 'beacon',
			debug_mode: isDebugMode,
			custom_map: {}
		});

		// Send initial page view if consent is given and not localhost
		if (!isLocalhost && cookiesAccepted) {
			try {
				window.gtag!('event', 'page_view', {
					page_title: document.title,
					page_location: window.location.href,
					page_path: window.location.pathname
				});
			} catch (error) {
				console.warn('Failed to send initial page view to Google Analytics:', error);
			}
		}

		// Clean up interaction listeners
		window.removeEventListener('scroll', state.listener);
		window.removeEventListener('mousemove', state.listener);
		window.removeEventListener('touchstart', state.listener);
		if (state.timer) clearTimeout(state.timer);
		console.log('GTM loaded.');
	}

	// Set up lazy loading via $effect
	$effect(() => {
		if (browser && !state.loaded) {
			const listenerOptions = { passive: true, once: true };
			window.addEventListener('scroll', state.listener, listenerOptions);
			window.addEventListener('mousemove', state.listener, listenerOptions);
			window.addEventListener('touchstart', state.listener, listenerOptions);

			// Fallback: Load GTM after 5 seconds if no interaction occurs
			state.timer = setTimeout(loadGtm, 5000);

			return () => {
				window.removeEventListener('scroll', state.listener);
				window.removeEventListener('mousemove', state.listener);
				window.removeEventListener('touchstart', state.listener);
				if (state.timer) clearTimeout(state.timer);
			};
		}
		return () => {};
	});

	/** Call in afterNavigate to track SPA page views */
	function trackPageView() {
		if (browser && state.loaded && typeof window.gtag === 'function') {
			const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true';
			const isLocalhost =
				window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

			if (!isLocalhost && cookiesAccepted) {
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
	}

	return { trackPageView };
}
