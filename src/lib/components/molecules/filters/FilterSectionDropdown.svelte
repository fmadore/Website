<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getFilterCount, getFilterLabel, clearFilterSelection } from '$lib/utils/filterHelpers';

	let {
		title,
		items,
		itemLabels = undefined,
		activeItems,
		toggleItem,
		counts,
		placeholder = 'Select...',
		searchThreshold = 8,
		maxHeight = '400px'
	}: {
		title: string;
		items: string[];
		itemLabels?: { [key: string]: string } | undefined;
		activeItems: string[];
		toggleItem: (item: string) => void;
		counts: { [key: string]: number | undefined } | undefined;
		placeholder?: string;
		searchThreshold?: number;
		maxHeight?: string;
	} = $props();

	let isOpen = $state(false);
	let searchQuery = $state('');
	let dropdownRef: HTMLDivElement;
	const uid = $props.id();
	const searchInputId = `filter-search-${uid}`;

	const showSearch = $derived(items.length >= searchThreshold);

	const filteredItems = $derived(
		showSearch && searchQuery.trim()
			? items.filter((item) =>
					getFilterLabel(itemLabels, item).toLowerCase().includes(searchQuery.toLowerCase())
				)
			: items
	);

	const displayText = $derived(
		activeItems.length === 0
			? placeholder
			: activeItems.length === 1
				? getFilterLabel(itemLabels, activeItems[0])
				: `${activeItems.length} selected`
	);

	// Toggle dropdown
	function toggleDropdown() {
		isOpen = !isOpen;
		if (isOpen) {
			// Reset search when opening
			searchQuery = '';
			// Focus search input if available
			setTimeout(() => {
				const searchInput = dropdownRef?.querySelector('input[type="text"]') as HTMLInputElement;
				searchInput?.focus();
			}, 0);
		}
	}

	function handleToggleItem(item: string) {
		toggleItem(item);
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (isOpen && dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false;
		}
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && isOpen) {
			isOpen = false;
		}
	}

	// Lifecycle: add/remove event listeners
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('keydown', handleKeydown);
			return () => {
				document.removeEventListener('click', handleClickOutside);
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

<div class="filter-section-content" bind:this={dropdownRef}>
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
		{#if activeItems.length > 0}
			<span class="active-count">{activeItems.length}</span>
		{/if}
	</div>

	<!-- Dropdown trigger button -->
	<button type="button" class="dropdown-trigger {isOpen ? 'open' : ''}" onclick={toggleDropdown}>
		<span class="dropdown-text">{displayText}</span>
		<Icon
			icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
			class="dropdown-icon"
			width="18"
			height="18"
		/>
	</button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div class="dropdown-menu" style="max-height: {maxHeight}">
			<!-- Search input -->
			{#if showSearch}
				<div class="search-container">
					<Icon icon="mdi:magnify" class="search-icon" width="16" height="16" />
					<input
						id={searchInputId}
						name={searchInputId}
						type="text"
						class="search-input"
						placeholder="Search..."
						aria-label="Search {title.toLowerCase()}"
						bind:value={searchQuery}
					/>
					{#if searchQuery}
						<button
							type="button"
							class="search-clear"
							onclick={() => (searchQuery = '')}
							aria-label="Clear search"
						>
							<Icon icon="mdi:close" width="16" height="16" />
						</button>
					{/if}
				</div>
			{/if}

			<!-- Dropdown items -->
			<div class="dropdown-items">
				{#if filteredItems.length === 0}
					<div class="no-results">No items found</div>
				{:else}
					{#each filteredItems as item (item)}
						<button
							type="button"
							class="filter-dropdown-item {activeItems.includes(item) ? 'active' : ''}"
							onclick={() => handleToggleItem(item)}
						>
							<span class="item-checkbox">
								{#if activeItems.includes(item)}
									<Icon icon="mdi:checkbox-marked" width="18" height="18" />
								{:else}
									<Icon icon="mdi:checkbox-blank-outline" width="18" height="18" />
								{/if}
							</span>
							<span class="item-label">{getFilterLabel(itemLabels, item)}</span>
							{#if counts !== undefined}
								<span class="item-count">{getFilterCount(counts, item)}</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer actions -->
			{#if activeItems.length > 0}
				<div class="dropdown-footer">
					<button
						type="button"
						class="clear-button"
						onclick={() => clearFilterSelection(activeItems, toggleItem)}
					>
						Clear all ({activeItems.length})
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Base styles provided by src/styles/components/filters.css */

	.filter-section-content {
		position: relative;
	}

	/* Dropdown trigger — a flat square mono control (a finding-aid select). */
	.dropdown-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-soft);
		background: transparent;
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		cursor: pointer;
		transition:
			color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.dropdown-trigger:hover {
		color: var(--color-text-emphasis);
		border-color: var(--color-border-dark);
	}

	.dropdown-trigger.open {
		border-color: var(--color-accent);
		color: var(--color-text-emphasis);
	}

	.dropdown-trigger:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.dropdown-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	:global(.dropdown-icon) {
		flex-shrink: 0;
		margin-left: var(--space-xs);
		color: var(--color-text-muted);
	}

	/* Dropdown menu — a flat paper panel: square, hairline frame, no shadow.
	 * An ink section rule at the top ties it to the trigger. */
	.dropdown-menu {
		position: absolute;
		left: 0;
		right: 0;
		margin-top: calc(-1 * var(--border-width-thin));
		background: var(--color-surface);
		border: var(--border-width-thin) solid var(--color-border-dark);
		border-radius: 0;
		overflow: visible;
		z-index: var(--z-dropdown);
		animation: dropdownFadeIn var(--duration-fast) var(--ease-out);
	}

	@keyframes dropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Search container */
	.search-container {
		position: relative;
		padding: var(--space-xs);
		border-bottom: var(--border-width-thin) solid var(--color-border-light);
	}

	:global(.search-icon) {
		position: absolute;
		left: calc(var(--space-xs) + var(--space-xs));
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-xs) var(--space-xl);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: 0;
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-serif);
		transition: border-color var(--duration-fast) var(--ease-out);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.search-clear {
		position: absolute;
		right: calc(var(--space-xs) + var(--space-xs));
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: var(--space-2xs);
		cursor: pointer;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-sm);
	}

	.search-clear:hover {
		color: var(--color-text);
	}

	/* Dropdown items */
	.dropdown-items {
		overflow-y: auto;
		max-height: 280px;
		background: var(--color-background);
	}

	.filter-dropdown-item {
		display: flex !important;
		align-items: center;
		width: 100%;
		padding: var(--space-sm) var(--space-sm);
		border: none;
		border-bottom: var(--border-width-thin) solid var(--color-border-light);
		background: transparent;
		color: var(--color-text-soft);
		font-size: var(--font-size-base);
		font-family: var(--font-family-serif);
		text-align: left;
		cursor: pointer;
		transition: color var(--duration-fast) var(--ease-out);
		/* Override global .dropdown-item styles */
		opacity: 1 !important;
		transform: none !important;
		position: relative;
		overflow: visible;
		margin-bottom: 0;
		border-radius: 0;
	}

	.filter-dropdown-item:last-child {
		border-bottom: none;
	}

	.filter-dropdown-item:hover {
		color: var(--color-text-emphasis);
	}

	/* Selected facet — pine type, no fill. */
	.filter-dropdown-item.active {
		color: var(--color-accent);
	}

	.filter-dropdown-item.active:hover {
		color: var(--color-accent-dark);
	}

	.item-checkbox {
		display: flex;
		align-items: center;
		margin-right: var(--space-xs);
		color: currentColor;
		flex-shrink: 0;
	}

	.item-label {
		flex: 1;
		line-height: var(--line-height-snug);
		color: inherit;
	}

	/* Count — mono figure, the data voice. */
	.item-count {
		margin-left: var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
	}

	.no-results {
		padding: var(--space-lg) var(--space-sm);
		text-align: center;
		color: var(--color-text-muted);
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-sm);
	}

	/* Dropdown footer */
	.dropdown-footer {
		padding: var(--space-xs);
		border-top: var(--border-width-thin) solid var(--color-border-light);
	}

	/* Clear — a mono-caps text action, not a filled button. */
	.clear-button {
		width: 100%;
		padding: var(--space-xs);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--color-danger) 80%, var(--color-text-muted));
		background: transparent;
		border: none;
		cursor: pointer;
		border-radius: 0;
		transition: color var(--duration-fast) var(--ease-out);
	}

	.clear-button:hover {
		color: var(--color-danger);
	}

	/* Dark mode — same flat treatment; only borders need the slate token. */
	:global(html.dark) .dropdown-trigger {
		background: transparent;
		border-color: var(--color-border);
	}

	:global(html.dark) .dropdown-trigger:hover {
		border-color: var(--color-border-dark);
	}

	:global(html.dark) .dropdown-menu {
		background: var(--color-surface);
		border-color: var(--color-border-dark);
	}

	:global(html.dark) .dropdown-items {
		background: transparent;
	}

	:global(html.dark) .filter-dropdown-item {
		background: transparent;
		border-color: var(--color-border);
	}

	:global(html.dark) .search-input {
		background: var(--color-background);
		border-color: var(--color-border);
	}

	/* Mobile dropdown adjustments */
	@media (--lg-down) {
		.dropdown-menu {
			position: relative;
			margin-top: var(--space-sm);
			box-shadow: none;
			border: var(--border-width-thin) solid var(--color-border);
		}
	}

	@media (--sm-down) {
		.dropdown-trigger {
			padding: var(--space-xs);
			font-size: var(--font-size-xs);
		}

		.dropdown-items {
			max-height: 200px;
		}
	}

	/* Scrollbar styling */
	.dropdown-items::-webkit-scrollbar {
		width: var(--space-1);
	}

	.dropdown-items::-webkit-scrollbar-track {
		background: transparent;
	}

	.dropdown-items::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--color-text-muted) 30%, transparent);
		border-radius: var(--border-radius-full);
	}

	.dropdown-items::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--color-text-muted) 50%, transparent);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.dropdown-trigger,
		.dropdown-menu,
		.filter-dropdown-item,
		.clear-button {
			transition: none;
		}

		.dropdown-menu {
			animation: none;
		}
	}
</style>
