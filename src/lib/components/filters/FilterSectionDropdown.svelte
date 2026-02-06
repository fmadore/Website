<script lang="ts">
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
							<span class="item-label">{getLabel(item)}</span>
							{#if counts !== undefined}
								<span class="item-count">{getCount(item)}</span>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			<!-- Footer actions -->
			{#if activeItems.length > 0}
				<div class="dropdown-footer">
					<button type="button" class="clear-button" onclick={clearSelection}>
						Clear all ({activeItems.length})
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.filter-section-content {
		padding: 0;
		position: relative;
	}

	.filter-section-header {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-sm);
	}

	.filter-section-title {
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
	}

	.active-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: var(--space-5);
		height: var(--space-5);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-white);
		background: var(--color-accent);
		border-radius: var(--border-radius-full);
		padding: 0 var(--space-2xs);
	}

	/* Dropdown trigger button */
	.dropdown-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-xs) var(--space-sm);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-text);
		background: color-mix(in srgb, var(--color-surface-alt) 50%, transparent);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		cursor: pointer;
		transition:
			background-color var(--duration-fast) var(--ease-out),
			border-color var(--duration-fast) var(--ease-out);
	}

	.dropdown-trigger:hover {
		background: color-mix(in srgb, var(--color-accent) 10%, transparent);
		border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
	}

	.dropdown-trigger.open {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, transparent);
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

	/* Dropdown menu */
	.dropdown-menu {
		position: absolute;
		left: 0;
		right: 0;
		margin-top: var(--space-2xs);
		background: var(--color-background);
		border: var(--border-width-thin) solid var(--color-border);
		border-radius: var(--border-radius);
		box-shadow: var(--shadow-lg);
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
		border-radius: var(--border-radius-sm);
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
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
		background: var(--color-background);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		text-align: left;
		cursor: pointer;
		transition: background-color var(--duration-fast) var(--ease-out);
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
		background: color-mix(in srgb, var(--color-accent) 10%, var(--color-background));
	}

	.filter-dropdown-item.active {
		background: color-mix(in srgb, var(--color-accent) 15%, var(--color-background));
	}

	.filter-dropdown-item.active:hover {
		background: color-mix(in srgb, var(--color-accent) 20%, var(--color-background));
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
		line-height: var(--line-height-snug);
		color: var(--color-text);
	}

	.item-count {
		margin-left: var(--space-xs);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.no-results {
		padding: var(--space-lg) var(--space-sm);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	/* Dropdown footer */
	.dropdown-footer {
		padding: var(--space-xs);
		border-top: var(--border-width-thin) solid var(--color-border-light);
	}

	.clear-button {
		width: 100%;
		padding: var(--space-xs);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-danger);
		background: transparent;
		border: none;
		cursor: pointer;
		border-radius: var(--border-radius-sm);
		transition: background-color var(--duration-fast) var(--ease-out);
	}

	.clear-button:hover {
		background: color-mix(in srgb, var(--color-danger) 10%, transparent);
	}

	/* Dark mode */
	:global(html.dark) .dropdown-trigger {
		background: color-mix(in srgb, var(--color-surface-alt) 30%, transparent);
		border-color: var(--color-border);
	}

	:global(html.dark) .dropdown-trigger:hover {
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
	}

	:global(html.dark) .dropdown-menu {
		background: var(--color-surface);
		border-color: var(--color-border);
	}

	:global(html.dark) .dropdown-items {
		background: var(--color-background);
	}

	:global(html.dark) .filter-dropdown-item {
		background: var(--color-background);
		border-color: var(--color-border);
	}

	:global(html.dark) .filter-dropdown-item:hover {
		background: color-mix(in srgb, var(--color-accent) 15%, var(--color-background));
	}

	:global(html.dark) .search-input {
		background: var(--color-background);
		border-color: var(--color-border);
	}

	/* Mobile: Cards for each section */
	@media (--lg-down) {
		.filter-section-content {
			background: var(--color-surface);
			border: var(--border-width-thin) solid var(--color-border);
			border-radius: var(--border-radius-md);
			padding: var(--space-md);
		}

		.dropdown-menu {
			position: relative;
			margin-top: var(--space-sm);
			box-shadow: none;
			border: var(--border-width-thin) solid var(--color-border);
		}

		:global(html.dark) .filter-section-content {
			background: var(--color-surface);
			border-color: var(--color-border);
		}
	}

	/* Responsive design */
	@media (--sm-down) {
		.filter-section-title {
			font-size: var(--font-size-xs);
		}

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
