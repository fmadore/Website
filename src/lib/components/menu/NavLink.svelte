<script lang="ts">
	let {
		href,
		active = false,
		hasDropdown = false,
		onclick,
		onkeydown,
		children,
		...restProps
	}: {
		href: string;
		active?: boolean;
		hasDropdown?: boolean;
		onclick?: (event: MouseEvent) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		children?: any;
		[key: string]: any;
	} = $props();
</script>

<a
	{href}
	data-nav-link
	data-active={active}
	aria-haspopup={hasDropdown ? 'true' : 'false'}
	{onclick}
	{onkeydown}
	{...restProps}
>
	{@render children?.()}
	{#if hasDropdown}
		<span data-dropdown-icon class="dropdown-icon">▾</span>
	{/if}
</a>
