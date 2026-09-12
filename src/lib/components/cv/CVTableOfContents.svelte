<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	/**
	 * Static source of truth for all CV sections.
	 * Order matches the rendering order in +page.svelte. Each label repeats its
	 * section heading verbatim: a contents list that renames its targets makes
	 * the reader translate, and a shortened label ("Events") no longer matches
	 * the heading they land on ("Organisation of Academic Events").
	 */
	const TOC_SECTIONS = [
		{ id: 'cv-appointments', label: 'Professional Appointments' },
		{ id: 'cv-education', label: 'Education' },
		{ id: 'cv-publications', label: 'Publications' },
		{ id: 'cv-grants', label: 'Grants & Fellowships' },
		{ id: 'cv-awards', label: 'Awards & Honours' },
		{ id: 'cv-digital-humanities', label: 'Digital Humanities Projects' },
		{ id: 'cv-invited-talks', label: 'Invited Talks' },
		{ id: 'cv-conferences', label: 'Conference Participation' },
		{ id: 'cv-events', label: 'Organisation of Academic Events' },
		{ id: 'cv-teaching', label: 'Teaching Experience' },
		{ id: 'cv-research-experience', label: 'Research Experience' },
		{ id: 'cv-service', label: 'Service to Profession' },
		{ id: 'cv-consulting', label: 'Consulting and Legal Expertise' },
		{ id: 'cv-media', label: 'Media Appearances' },
		{ id: 'cv-languages', label: 'Languages' },
		{ id: 'cv-affiliations', label: 'Professional Affiliations' },
		{ id: 'cv-computer-skills', label: 'Computer Skills' }
	] as const;

	/** Sections currently present in the DOM */
	let visibleIds = new SvelteSet<string>();
	/**
	 * Ledger rows counted per section. Data is the only ornament this system
	 * allows, and a contents list that says how many records each section holds
	 * is apparatus rather than chrome — a peer scanning for "how much teaching?"
	 * gets the answer before jumping. Counted off the rendered DOM rather than
	 * imported from the datasets: the ToC then reports what the page actually
	 * shipped, and the eighteen data modules stay out of this chunk.
	 */
	let entryCounts = new SvelteMap<string, number>();
	/** Currently active (in-viewport) section id */
	let activeId = $state<string>('');
	/** Panel open state */
	let isOpen = $state(false);
	/** The control the panel hangs off — Escape hands focus back to it. */
	let fabEl = $state<HTMLButtonElement | null>(null);

	const visibleSections = $derived(TOC_SECTIONS.filter((s) => visibleIds.has(s.id)));

	onMount(() => {
		const cvContent = document.getElementById('cv-content');
		if (!cvContent) return;

		// --- Scan DOM for section elements and update visibleIds ---
		function scanSections() {
			for (const s of TOC_SECTIONS) {
				const el = document.getElementById(s.id);
				if (!el) continue;
				visibleIds.add(s.id);
				const count = el.querySelectorAll('.cv-entry').length;
				if (entryCounts.get(s.id) !== count) entryCounts.set(s.id, count);
			}
		}
		// One call is enough. All seventeen sections have been static imports
		// since 5.1, so they are in the prerendered HTML before this runs; the
		// MutationObserver and 500ms poll that used to chase four lazy batches
		// were watching a 219-row subtree for changes that can no longer happen.
		scanSections();

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

		for (const s of TOC_SECTIONS) {
			const el = document.getElementById(s.id);
			if (el) sectionObserver.observe(el);
		}

		return () => {
			clearTimeout(debounceTimer);
			sectionObserver.disconnect();
		};
	});

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (!el) return;
		// Honour `prefers-reduced-motion`. Svelte transitions read this via the
		// `motion` helper, but `scrollIntoView({ behavior: 'smooth' })` does not
		// — it must be feature-detected and downgraded to 'auto' explicitly.
		const reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
		isOpen = false;
	}

	function handleKeydown(event: KeyboardEvent) {
		// Escape closes the panel and hands focus back to the control it hangs
		// off. Without this the reader is dropped on <body> — back at the top of
		// a 142-stop tab order, 23 masthead stops from where they were (WCAG
		// 2.4.3). Guarded on `isOpen` so Escape elsewhere on the sheet does not
		// pull focus to a closed control.
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
			fabEl?.focus();
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
		bind:this={fabEl}
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
							<span class="cv-toc-label">{section.label}</span>
							{#if entryCounts.get(section.id)}
								{@const count = entryCounts.get(section.id) ?? 0}
								<!-- The figure is the visible mark; speech gets the noun it counts,
								     so the button announces "Publications 42 entries" rather than
								     "Publications 42". The space lives inside the expression: as a
								     literal before `{count === 1 …}` Svelte trimmed it at compile
								     time and the accessible name read "Publications 42entries". -->
								<span class="cv-toc-count"
									>{count}<span class="sr-only">{count === 1 ? ' entry' : ' entries'}</span></span
								>
							{/if}
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

	/* ===================== FAB BUTTON =====================
	 * Square ink stamp, no shadow, no scale-lift — a printer's mark, not a
	 * material-design fab. Paper text on ink; inverts to a quiet outline when
	 * open. */
	.cv-toc-fab {
		width: var(--space-12);
		height: var(--space-12);
		border: var(--border-width-thin) solid var(--color-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		color: var(--color-text-inverted);
		background: var(--color-primary);
		transition:
			background var(--duration-fast) var(--ease-out),
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.cv-toc-fab:hover {
		background: var(--color-primary-dark);
		border-color: var(--color-primary-dark);
	}

	.cv-toc-fab.open {
		background: var(--color-surface);
		color: var(--color-text-emphasis);
		border-color: var(--color-border-dark);
	}

	.cv-toc-fab:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-thin);
	}

	/* ===================== PANEL =====================
	 * Flat paper popover — solid surface, square corners, hairline border, no
	 * glass or shadow. A slip of index-card stock pinned over the page. */
	.cv-toc-panel {
		position: absolute;
		bottom: calc(var(--space-12) + var(--space-2));
		left: 0;
		width: 15rem;
		max-height: 60vh;
		overflow-y: auto;
		padding: var(--space-3);
		background: var(--color-surface-elevated);
		border: var(--border-width-thin) solid var(--color-border-dark);
	}

	:global(html.dark) .cv-toc-panel {
		background: var(--color-surface-alt);
		border-color: var(--color-border-dark);
	}

	/* Panel title — DATA voice: mono, uppercase, letterspaced, over a hairline. */
	.cv-toc-title {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-text-muted);
		margin: 0 0 var(--space-2);
		padding: 0 var(--space-1) var(--space-2);
		border-bottom: var(--rule-hairline) solid var(--color-hairline);
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

	/* TOC entry — DATA voice: mono, uppercase, letterspaced, with the section's
	 * own row count set as a tabular figure on the right. A square accent tick
	 * marks the active section; no rounded pill, no tinted fill. */
	.cv-toc-link {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-2);
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: var(--space-1) var(--space-2);
		/* WCAG 2.5.8 applies to every pointer, not only a coarse one: at 11px mono
		 * over 4px padding these rows measured 23px with a mouse. 24px is the
		 * floor; the --touch step below takes them to 44px. */
		min-height: var(--space-6);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: var(--tracking-caps);
		text-transform: uppercase;
		line-height: var(--line-height-snug);
		color: var(--color-text-light);
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
		position: relative;
	}

	/* Active-section tick — a solid accent bar. It used to scale in from zero
	 * over 300ms so the highlight "slid" between sections; the register is
	 * print, and a state change here is instant. */
	.cv-toc-link::before {
		content: '';
		position: absolute;
		left: 0;
		top: var(--space-1);
		bottom: var(--space-1);
		width: var(--border-width-medium);
		background: var(--color-accent);
		opacity: 0;
	}

	.cv-toc-link:hover {
		color: var(--color-text-emphasis);
	}

	.cv-toc-link.active {
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
	}

	.cv-toc-link.active::before {
		opacity: 1;
	}

	.cv-toc-link:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--border-width-thin);
	}

	/* The section's own row count — tabular so the column aligns down the list. */
	.cv-toc-count {
		font-variant-numeric: tabular-nums;
		font-weight: var(--font-weight-normal);
		color: var(--color-text-muted);
	}

	.cv-toc-link.active .cv-toc-count {
		color: inherit;
	}

	/* Coarse pointers get the 44px standing minimum: these are 20px mono caps
	 * stacked a pixel apart, which is the tightest target list on the site. */
	@media (--touch) {
		.cv-toc-link {
			min-height: var(--space-11);
			align-items: center;
		}
	}

	/* ===================== PRINT & A11Y ===================== */
	@media print {
		.cv-toc {
			display: none !important;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.cv-toc-link,
		.cv-toc-fab {
			transition: none;
		}
	}
</style>
