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
			? items.filter((item) =>
					getLabel(item).toLowerCase().includes(searchQuery.toLowerCase())
				)
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

<div class="filter-section-content glass-panel-light" bind:this={dropdownRef}>
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
		padding: var(--spacing-4);
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-4);
		position: relative;
		transition: all var(--anim-duration-base) var(--anim-ease-base);
	}

	.filter-section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-3);
	}

	.filter-section-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-text-emphasis);
		margin: 0;
		padding-bottom: var(--spacing-2);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-accent-rgb), var(--opacity-medium));
		flex: 1;
	}

	.active-count {
		font-size: var(--font-size-sm);
		color: var(--color-accent);
		font-weight: var(--font-weight-semibold);
		background: rgba(var(--color-accent-rgb), var(--opacity-low));
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
	}

	/* Dropdown trigger button */
	:global(.dropdown-trigger) {
		width: 100%;
		justify-content: space-between;
		text-align: left;
	}

	.dropdown-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.dropdown-icon) {
		flex-shrink: 0;
		margin-left: var(--spacing-2);
		transition: transform var(--anim-duration-fast) var(--anim-ease-out);
	}

	/* Dropdown menu */
	.dropdown-menu {
		margin-top: var(--spacing-2);
		background: rgba(var(--color-surface-rgb), 0.95);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-medium));
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-md);
		overflow: hidden;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	/* Search container */
	.search-container {
		position: relative;
		padding: var(--spacing-2) var(--spacing-3);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-border-rgb), var(--opacity-medium));
		background: rgba(var(--color-surface-rgb), var(--opacity-low));
	}

	:global(.search-icon) {
		position: absolute;
		left: calc(var(--spacing-3) + var(--spacing-2));
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-2) var(--spacing-8) var(--spacing-2) var(--spacing-8);
		border: var(--border-width-thin) solid rgba(var(--color-border-rgb), var(--opacity-medium));
		border-radius: var(--border-radius-sm);
		background: rgba(var(--color-surface-rgb), var(--opacity-high));
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
		background: var(--color-surface);
		box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), var(--opacity-low));
	}

	.search-clear {
		position: absolute;
		right: calc(var(--spacing-3) + var(--spacing-2));
		top: 50%;
		transform: translateY(-50%);
		background: none;
		border: none;
		padding: var(--spacing-1);
		cursor: pointer;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-sm);
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
	}

	.search-clear:hover {
		color: var(--color-text);
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
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
		padding: var(--spacing-2) var(--spacing-3);
		border: none;
		background: transparent;
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		text-align: left;
		cursor: pointer;
		transition: all var(--anim-duration-fast) var(--anim-ease-out);
		border-bottom: var(--border-width-thin) solid
			rgba(var(--color-border-rgb), var(--opacity-low));
	}

	.dropdown-item:last-child {
		border-bottom: none;
	}

	.dropdown-item:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-low));
	}

	.dropdown-item.active {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium));
		color: var(--color-text-emphasis);
	}

	.dropdown-item.active:hover {
		background: rgba(var(--color-accent-rgb), var(--opacity-medium-high));
	}

	.item-checkbox {
		display: flex;
		align-items: center;
		margin-right: var(--spacing-2);
		color: var(--color-accent);
		flex-shrink: 0;
	}

	.item-label {
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		line-height: var(--line-height-normal);
	}

	.item-count {
		margin-left: var(--spacing-2);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		color: var(--color-text-muted);
		background: rgba(var(--color-surface-rgb), var(--opacity-medium));
		padding: var(--spacing-1) var(--spacing-2);
		border-radius: var(--border-radius-sm);
		flex-shrink: 0;
		align-self: center;
	}

	.no-results {
		padding: var(--spacing-6) var(--spacing-3);
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-style: italic;
	}

	/* Dropdown footer */
	.dropdown-footer {
		padding: var(--spacing-2) var(--spacing-3);
		border-top: var(--border-width-thin) solid
			rgba(var(--color-border-rgb), var(--opacity-medium));
		background: rgba(var(--color-surface-rgb), var(--opacity-low));
	}

	:global(.clear-button) {
		width: 100%;
	}

	/* Dark mode overrides */
	:global(html.dark) .filter-section-content {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border: var(--border-width-thin) solid rgba(var(--color-white-rgb), var(--opacity-low));
		box-shadow:
			0 8px 32px 0 rgba(var(--color-black-rgb), var(--opacity-medium)),
			inset 0 1px 0 rgba(var(--color-white-rgb), var(--opacity-low));
	}

	:global(html.dark) .dropdown-menu {
		background: rgba(var(--color-dark-surface-rgb), 0.95);
		border-color: rgba(var(--color-border-rgb), var(--opacity-medium));
		box-shadow: var(--shadow-md);
	}

	:global(html.dark) .search-container {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
	}

	:global(html.dark) .search-input {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
		border-color: rgba(var(--color-white-rgb), var(--opacity-low));
		color: var(--color-text);
	}

	:global(html.dark) .search-input:focus {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-high));
	}

	:global(html.dark) .dropdown-footer {
		background: rgba(var(--color-dark-surface-rgb), var(--opacity-medium));
		border-color: rgba(var(--color-white-rgb), var(--opacity-low));
	}

	/* Responsive design */
	@media (max-width: 640px) {
		.filter-section-content {
			padding: var(--spacing-3);
		}

		.dropdown-menu {
			max-height: 300px;
		}

		.dropdown-items {
			max-height: calc(300px - 80px);
		}
	}

	/* Scrollbar styling */
	.dropdown-items::-webkit-scrollbar {
		width: 8px;
	}

	.dropdown-items::-webkit-scrollbar-track {
		background: rgba(var(--color-surface-rgb), var(--opacity-low));
		border-radius: var(--border-radius-sm);
	}

	.dropdown-items::-webkit-scrollbar-thumb {
		background: rgba(var(--color-text-rgb), var(--opacity-medium));
		border-radius: var(--border-radius-sm);
	}

	.dropdown-items::-webkit-scrollbar-thumb:hover {
		background: rgba(var(--color-text-rgb), var(--opacity-medium-high));
	}

	/* Respect user motion preferences */
	@media (prefers-reduced-motion: reduce) {
		.filter-section-content,
		.dropdown-menu,
		.search-input,
		.dropdown-item,
		:global(.dropdown-icon) {
			transition: none;
		}
	}
</style>
