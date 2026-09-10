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
	<!-- The first focusable element on every page: the masthead alone costs
	     15–23 tab stops before the reading column starts. -->
	<a class="skip-link" href="#main">Skip to content</a>

	<Header />

	<!-- In flow directly under the masthead: an offline notice is part of the
	     page's own record, not a floating toast over it. -->
	<NetworkStatusIndicator />

	<main id="main" class="main-content-area" tabindex="-1">
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

	/* Skip link — a square ink stamp in the data voice, parked above the
	 * viewport until it takes focus, then pinned over the masthead's top-left
	 * corner. No radius, no shadow: it is a stamp, not a toast. */
	.skip-link {
		position: fixed;
		top: 0;
		left: 0;
		z-index: calc(var(--z-modal) + 1);
		/* Parked clear of the top edge — the extra step keeps a subpixel sliver
		 * of the stamp from grazing the masthead at fractional device ratios. */
		transform: translateY(calc(-100% - var(--space-2)));
		padding: var(--space-2) var(--space-4);
		background: var(--color-primary);
		color: var(--color-background);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		text-decoration: none;
		border-radius: 0;
	}

	.skip-link:focus-visible {
		transform: translateY(0);
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: calc(-1 * var(--border-width-medium));
	}

	/* The skip target is programmatically focusable only; a ring around the
	 * whole reading column would be noise, and `:focus-visible` never fires
	 * for a fragment jump. */
	.main-content-area:focus {
		outline: none;
	}
</style>
