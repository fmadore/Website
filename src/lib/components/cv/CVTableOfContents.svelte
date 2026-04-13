<script lang="ts">
	import { onMount } from 'svelte';

	/**
	 * Static source of truth for all CV sections.
	 * Order matches the rendering order in +page.svelte.
	 */
	const TOC_SECTIONS = [
		{ id: 'cv-appointments', label: 'Appointments' },
		{ id: 'cv-education', label: 'Education' },
		{ id: 'cv-publications', label: 'Publications' },
		{ id: 'cv-grants', label: 'Grants' },
		{ id: 'cv-awards', label: 'Awards' },
		{ id: 'cv-digital-humanities', label: 'Digital Humanities' },
		{ id: 'cv-invited-talks', label: 'Invited Talks' },
		{ id: 'cv-conferences', label: 'Conferences' },
		{ id: 'cv-events', label: 'Events' },
		{ id: 'cv-teaching', label: 'Teaching' },
		{ id: 'cv-research-experience', label: 'Research Experience' },
		{ id: 'cv-service', label: 'Service' },
		{ id: 'cv-consulting', label: 'Consulting' },
		{ id: 'cv-media', label: 'Media' },
		{ id: 'cv-languages', label: 'Languages' },
		{ id: 'cv-affiliations', label: 'Affiliations' },
		{ id: 'cv-computer-skills', label: 'Computer Skills' }
	] as const;

	/** Sections currently present in the DOM */
	let visibleIds = $state<Set<string>>(new Set());
	/** Currently active (in-viewport) section id */
	let activeId = $state<string>('');
	/** Panel open state */
	let isOpen = $state(false);

	const visibleSections = $derived(TOC_SECTIONS.filter((s) => visibleIds.has(s.id)));

	onMount(() => {
		const cvContent = document.getElementById('cv-content');
		if (!cvContent) return;

		// --- Scan for sections already in the DOM ---
		function scanExisting() {
			for (const s of TOC_SECTIONS) {
				if (document.getElementById(s.id)) {
					visibleIds.add(s.id);
				}
			}
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			visibleIds = new Set(visibleIds);
		}
		scanExisting();

		// --- MutationObserver: detect lazy-loaded sections ---
		const mutationObs = new MutationObserver(() => {
			let changed = false;
			for (const s of TOC_SECTIONS) {
				if (!visibleIds.has(s.id) && document.getElementById(s.id)) {
					visibleIds.add(s.id);
					changed = true;
				}
			}
			if (changed) {
				visibleIds = new Set(visibleIds);
			}
		});
		mutationObs.observe(cvContent, { childList: true, subtree: true });

		// --- IntersectionObserver: scroll-spy ---
		let debounceTimer: ReturnType<typeof setTimeout>;
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				clearTimeout(debounceTimer);
				debounceTimer = setTimeout(() => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							activeId = entry.target.id;
						}
					}
				}, 50);
			},
			{
				rootMargin: '-80px 0px -60% 0px'
			}
		);

		// Observe existing sections and re-observe when new ones appear
		function observeAll() {
			sectionObserver.disconnect();
			for (const s of TOC_SECTIONS) {
				const el = document.getElementById(s.id);
				if (el) sectionObserver.observe(el);
			}
		}
		observeAll();

		// Re-observe whenever new lazy sections load
		const reobserveInterval = setInterval(() => {
			observeAll();
		}, 500);

		// Stop re-observing once all sections are loaded
		const checkComplete = setInterval(() => {
			if (visibleIds.size === TOC_SECTIONS.length) {
				clearInterval(reobserveInterval);
				clearInterval(checkComplete);
				observeAll();
			}
		}, 1000);

		return () => {
			clearTimeout(debounceTimer);
			clearInterval(reobserveInterval);
			clearInterval(checkComplete);
			mutationObs.disconnect();
			sectionObserver.disconnect();
		};
	});

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (isOpen && !target.closest('.cv-toc')) {
			isOpen = false;
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} onclick={handleClickOutside} />

<div class="cv-toc">
	<button
		class="cv-toc-fab"
		class:open={isOpen}
		onclick={(e: MouseEvent) => {
			e.stopPropagation();
			isOpen = !isOpen;
		}}
		aria-expanded={isOpen}
		aria-label="Table of contents"
		type="button"
	>
		{#if isOpen}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<line x1="3" y1="6" x2="21" y2="6" />
				<line x1="3" y1="12" x2="15" y2="12" />
				<line x1="3" y1="18" x2="9" y2="18" />
			</svg>
		{/if}
	</button>

	{#if isOpen}
		<nav class="cv-toc-panel" aria-label="CV table of contents">
			<p class="cv-toc-title">Contents</p>
			<ul class="cv-toc-list">
				{#each visibleSections as section (section.id)}
					<li>
						<button
							class="cv-toc-link"
							class:active={activeId === section.id}
							onclick={() => scrollTo(section.id)}
							aria-current={activeId === section.id ? 'true' : undefined}
						>
							{section.label}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	{/if}
</div>

<style>
	/* ===================== CONTAINER ===================== */
	.cv-toc {
		position: fixed;
		bottom: var(--space-6);
		left: var(--space-6);
		z-index: var(--z-fixed);
	}

	/* ===================== FAB BUTTON ===================== */
	.cv-toc-fab {
		width: var(--space-12);
		height: var(--space-12);
		border-radius: var(--border-radius-full);
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-white);
		background: var(--color-primary);
		box-shadow:
			var(--shadow-lg),
			0 4px 16px 0
				color-mix(
					in srgb,
					var(--color-primary) calc(var(--opacity-medium-high) * 100%),
					transparent
				);
		transition: all var(--duration-fast) ease;
	}

	.cv-toc-fab:hover {
		transform: scale(var(--scale-105));
		box-shadow:
			var(--shadow-xl),
			0 6px 20px 0
				color-mix(in srgb, var(--color-primary) calc(var(--opacity-high) * 100%), transparent);
	}

	.cv-toc-fab.open {
		background: var(--color-text-light);
	}

	.cv-toc-fab:focus-visible {
		outline: var(--border-width-medium) solid var(--color-white);
		outline-offset: var(--border-width-medium);
	}

	/* ===================== PANEL ===================== */
	.cv-toc-panel {
		position: absolute;
		bottom: calc(var(--space-12) + var(--space-2));
		left: 0;
		width: 200px;
		max-height: 60vh;
		overflow-y: auto;
		padding: var(--space-3);
		border-radius: var(--border-radius-xl);
		background: color-mix(in srgb, var(--color-white) 85%, transparent);
		-webkit-backdrop-filter: blur(var(--glass-blur-amount)) saturate(120%);
		backdrop-filter: blur(var(--glass-blur-amount)) saturate(120%);
		border: var(--border-width-thin) solid color-mix(in srgb, var(--color-white) 40%, transparent);
		box-shadow:
			var(--shadow-xl),
			inset 0 1px 0
				color-mix(
					in srgb,
					var(--color-white) calc(var(--card-glass-inset-light) * 100%),
					transparent
				);
		animation: tocSlideUp var(--duration-normal) ease forwards;
	}

	:global(html.dark) .cv-toc-panel {
		background: color-mix(in srgb, var(--color-dark-surface) 90%, transparent);
		border-color: color-mix(in srgb, var(--color-white) 10%, transparent);
		box-shadow:
			var(--shadow-xl),
			inset 0 1px 0 color-mix(in srgb, var(--color-white) 5%, transparent);
	}

	.cv-toc-title {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		color: var(--color-text-light);
		margin: 0 0 var(--space-2) var(--space-2);
	}

	@keyframes tocSlideUp {
		from {
			opacity: 0;
			transform: translateY(var(--space-2));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ===================== LIST & LINKS ===================== */
	.cv-toc-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-px);
	}

	.cv-toc-link {
		display: block;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-xs);
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
		cursor: pointer;
		transition:
			color var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
		position: relative;
	}

	/* Indicator bar is always present but zero-scaled when inactive; we
	 * transition transform/opacity so switching the active section slides the
	 * highlight smoothly from its previous position into the new one. */
	.cv-toc-link::before {
		content: '';
		position: absolute;
		left: 0;
		top: var(--space-1);
		bottom: var(--space-1);
		width: var(--border-width-medium);
		background: var(--color-primary);
		border-radius: var(--border-radius-full);
		opacity: 0;
		transform: scaleY(0);
		transform-origin: center;
		transition:
			transform var(--duration-normal) var(--ease-out),
			opacity var(--duration-normal) var(--ease-out);
	}

	.cv-toc-link:hover {
		color: var(--color-primary);
		background: color-mix(in srgb, var(--color-primary) 8%, transparent);
	}

	.cv-toc-link.active {
		color: var(--color-primary);
		font-weight: var(--font-weight-semibold);
		background: color-mix(in srgb, var(--color-primary) 12%, transparent);
	}

	.cv-toc-link.active::before {
		opacity: 1;
		transform: scaleY(1);
	}

	.cv-toc-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-primary);
		outline-offset: var(--border-width-thin);
	}

	/* ===================== PRINT & A11Y ===================== */
	@media print {
		.cv-toc {
			display: none !important;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cv-toc-link,
		.cv-toc-link::before,
		.cv-toc-fab {
			transition: none;
		}

		.cv-toc-panel {
			animation: none;
		}
	}
</style>
