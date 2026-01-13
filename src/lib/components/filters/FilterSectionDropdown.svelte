<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '@iconify/svelte';

	let {
		title,
		items, // List of filter items
		itemLabels = undefined, // Optional labels mapping
		activeItems, // List of active items
		toggleItem, // Function to toggle an item
		counts, // Item counts
		placeholder = 'Select...',
		searchThreshold = 8, // When to show search
		maxHeight = '400px' // Maximum dropdown height
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

	// Local state
	let isOpen = $state(false);
	let searchQuery = $state('');
	let dropdownRef: HTMLDivElement;

	// Show search if items exceed threshold
	const showSearch = $derived(items.length >= searchThreshold);

	// Helper to safely get count
	function getCount(item: string): number {
		return counts?.[item] ?? 0;
	}

	// Helper to get label
	function getLabel(item: string): string {
		return itemLabels?.[item] ?? item;
	}

	// Filtered items based on search
	const filteredItems = $derived(
		showSearch && searchQuery.trim()
			? items.filter((item) => getLabel(item).toLowerCase().includes(searchQuery.toLowerCase()))
			: items
	);

	// Display text for the dropdown button
	const displayText = $derived(
		activeItems.length === 0
			? placeholder
			: activeItems.length === 1
				? getLabel(activeItems[0])
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

	// Handle item toggle
	function handleToggleItem(item: string) {
		toggleItem(item);
		// Don't close dropdown on selection for better UX
	}

	// Clear all selections
	function clearSelection() {
		activeItems.forEach((item) => toggleItem(item));
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

<div class="filter-section-content glass-panel-light scroll-reveal" bind:this={dropdownRef}>
	<div class="filter-section-header">
		<h3 class="filter-section-title">{title}</h3>
		{#if activeItems.length > 0}
			<span class="active-count">({activeItems.length})</span>
		{/if}
	</div>

	<!-- Dropdown trigger button -->
	<Button
		variant="outline-secondary"
		size="sm"
		glass={true}
		additionalClasses="dropdown-trigger {isOpen ? 'open' : ''}"
		onclick={toggleDropdown}
	>
		<span class="dropdown-text">{displayText}</span>
		<Icon
			icon={isOpen ? 'mdi:chevron-up' : 'mdi:chevron-down'}
			class="dropdown-icon"
			width="20"
			height="20"
		/>
	</Button>

	<!-- Dropdown menu -->
	{#if isOpen}
		<div class="dropdown-menu" style="max-height: {maxHeight}">
			<!-- Search input -->
			{#if showSearch}
				<div class="search-container">
					<Icon icon="mdi:magnify" class="search-icon" width="16" height="16" />
					<input
						type="text"
						class="search-input"
						placeholder="Search..."
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
							class="dropdown-item {activeItems.includes(item) ? 'active' : ''}"
							onclick={() => handleToggleItem(item)}
						>
							<span class="item-checkbox">
								{#if activeItems.includes(item)}
									<Icon icon="mdi:checkbox-marked" width="18" height="18" />
								{:else}
									<Icon icon="mdi:checkbox-blank-outline" width="18" height="18" />
								{/if}
							</span>
							<span class="item-label">{getLabel(item)}</span>
							{#if counts !== undefined}
								<span class="item-count">({getCount(item)})</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer actions -->
			{#if activeItems.length > 0}
				<div class="dropdown-footer">
					<Button
						variant="secondary"
						size="sm"
						glass={true}
						additionalClasses="clear-button"
						onclick={clearSelection}
					>
						Clear selection ({activeItems.length})
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.filter-section-content {
		padding: var(--space-md);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--space-md);
		position: relative;
		transition: all var(--duration-normal) var(--ease-out);
	}

	.filter-section-content:hover {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-medium) * 100%),
			transparent
		);
		box-shadow: var(--shadow-md);
		transform: var(--transform-lift-sm);
	}

	.filter-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
		gap: var(--space-sm);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		padding-bottom: var(--space-xs);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-medium) * 100%), transparent);
		flex: 1;
		min-width: 0;
	}

	.active-count {
		font-size: var(--font-size-sm);
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-low) * 100%),
			transparent
		);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
		flex-shrink: 0;
	}

	/* Dropdown trigger button */
	:global(.dropdown-trigger) {
		width: 100%;
		justify-content: space-between;
		text-align: left;
		padding-left: var(--space-sm);
		padding-right: var(--space-sm);
		min-width: 0; /* Allow button to shrink */
	}

	.dropdown-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0; /* Allow text to shrink */
		text-align: left;
	}

	:global(.dropdown-icon) {
		flex-shrink: 0;
		margin-left: var(--space-xs);
		transition: transform var(--duration-fast) var(--ease-out);
	}

	/* Dropdown menu */
	.dropdown-menu {
		margin-top: var(--space-xs);
		background: color-mix(in srgb, var(--color-surface) 95%, transparent);
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium) * 100%), transparent);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		backdrop-filter: blur(var(--glass-blur-amount));
		-webkit-backdrop-filter: blur(var(--glass-blur-amount));
		z-index: var(--z-dropdown);
		/* Entry animation for dropdown */
		animation: dropdownFadeIn var(--duration-fast) var(--ease-out);
	}

	@keyframes dropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Search container */
	.search-container {
		position: relative;
		padding: var(--space-xs) var(--space-sm);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium) * 100%), transparent);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(.search-icon) {
		position: absolute;
		left: calc(var(--space-sm) + var(--space-xs));
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--space-xs) var(--space-xl) var(--space-xs) var(--space-xl);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium) * 100%), transparent);
		border-radius: var(--border-radius-sm);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-high) * 100%),
			transparent
		);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		transition: all var(--duration-fast) var(--ease-out);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
		background: var(--color-surface);
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--color-accent) calc(var(--opacity-low) * 100%), transparent);
	}

	.search-clear {
		position: absolute;
		right: calc(var(--space-sm) + var(--space-xs));
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
		transition: all var(--duration-fast) var(--ease-out);
	}

	.search-clear:hover {
		color: var(--color-text);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
	}

	/* Dropdown items */
	.dropdown-items {
		overflow-y: auto;
		max-height: 300px;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--space-xs) var(--space-sm);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		text-align: left;
		cursor: pointer;
		transition: all var(--duration-fast) var(--ease-out);
		border-bottom: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-low) * 100%), transparent);
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.dropdown-item:hover {
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	.dropdown-item.active {
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium) * 100%),
			transparent
		);
		color: var(--color-text-emphasis);
	}

	.dropdown-item.active:hover {
		background: color-mix(
			in srgb,
			var(--color-accent) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
	}

	.item-checkbox {
		display: flex;
		align-items: center;
		margin-right: var(--space-xs);
		color: var(--color-accent);
		flex-shrink: 0;
	}

	.item-label {
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		line-height: var(--line-height-normal);
		color: var(--color-text);
	}

	.item-count {
		margin-left: var(--space-xs);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		padding: var(--space-2xs) var(--space-xs);
		border-radius: var(--border-radius-sm);
		flex-shrink: 0;
		align-self: center;
	}

	.no-results {
		padding: var(--space-lg) var(--space-sm);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-style: italic;
	}

	/* Dropdown footer */
	.dropdown-footer {
		padding: var(--space-xs) var(--space-sm);
		border-top: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-border) calc(var(--opacity-medium) * 100%), transparent);
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(.clear-button) {
		width: 100%;
	}

	/* Dark mode overrides */
	:global(html.dark) .filter-section-content {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border: var(--border-width-thin) solid
			color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
		box-shadow:
			var(--shadow-glass),
			inset 0 1px 0
				color-mix(in srgb, var(--color-white) calc(var(--opacity-low) * 100%), transparent);
	}

	:global(html.dark) .dropdown-menu {
		background: color-mix(in srgb, var(--color-dark-surface) 95%, transparent);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
		box-shadow: var(--shadow-lg);
	}

	:global(html.dark) .search-container {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .search-input {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
		color: var(--color-text);
	}

	:global(html.dark) .search-input:focus {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-high) * 100%),
			transparent
		);
	}

	:global(html.dark) .dropdown-footer {
		background: color-mix(
			in srgb,
			var(--color-dark-surface) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	:global(html.dark) .dropdown-item {
		border-color: color-mix(
			in srgb,
			var(--color-white) calc(var(--opacity-low) * 100%),
			transparent
		);
	}

	/* Responsive design - Mobile first */
	@media (--sm-down) {
		.filter-section-content {
			padding: var(--space-sm);
			margin-bottom: var(--space-sm);
		}

		.filter-section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-xs);
		}

		.filter-section-title {
			font-size: var(--font-size-base);
			width: 100%;
		}

		:global(.dropdown-trigger) {
			padding: var(--space-xs) var(--space-sm);
			font-size: var(--font-size-sm);
		}

		.dropdown-text {
			font-size: var(--font-size-sm);
		}

		:global(.dropdown-icon) {
		width: var(--space-4);
		height: var(--space-4);
		}

		.dropdown-menu {
			max-height: 280px;
		}

		.dropdown-items {
			max-height: 200px;
		}

		.search-container {
			padding: var(--space-xs);
		}

		.search-input {
			font-size: var(--font-size-base);
			padding: var(--space-sm) var(--space-xl);
		}
	}

	/* Medium screens */
	@media (--sm) and (--lg-down) {
		.dropdown-items {
			max-height: 280px;
		}
	}

	/* Large screens */
	@media (--lg) {
		.filter-section-content {
			padding: var(--space-lg);
		}

		.dropdown-items {
			max-height: 350px;
		}
	}

	/* Scrollbar styling */
	.dropdown-items::-webkit-scrollbar {
		width: var(--space-2);
	}

	.dropdown-items::-webkit-scrollbar-track {
		background: color-mix(
			in srgb,
			var(--color-surface) calc(var(--opacity-low) * 100%),
			transparent
		);
		border-radius: var(--border-radius-sm);
	}

	.dropdown-items::-webkit-scrollbar-thumb {
		background: color-mix(
			in srgb,
			var(--color-text) calc(var(--opacity-medium) * 100%),
			transparent
		);
		border-radius: var(--border-radius-sm);
	}

	.dropdown-items::-webkit-scrollbar-thumb:hover {
		background: color-mix(
			in srgb,
			var(--color-text) calc(var(--opacity-medium-high) * 100%),
			transparent
		);
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.dropdown-menu,
		.search-input,
		.dropdown-item,
		.search-clear,
		:global(.dropdown-icon) {
			transition: none;
		}

		.filter-section-content:hover {
			transform: none;
		}

		/* Disable scroll-driven and entry animations */
		.filter-section-content {
			opacity: 1;
			transform: none;
			animation: none;
		}

		.dropdown-menu {
			animation: none;
		}
	}
</style>
