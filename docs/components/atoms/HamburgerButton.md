# HamburgerButton Component

A customizable hamburger button component that toggles between normal and active states, commonly used for opening and closing mobile navigation menus.

## Import

```svelte
import HamburgerButton from '$lib/components/atoms/HamburgerButton.svelte';
```

## Usage

```svelte
<HamburgerButton isActive={mobileMenuOpen} onClick={toggleMobileMenu} />
```

## Props

| Prop       | Type         | Default    | Description                                      |
| ---------- | ------------ | ---------- | ------------------------------------------------ |
| `isActive` | `boolean`    | `false`    | Controls the state of the button (normal/active) |
| `onClick`  | `() => void` | _required_ | Function called when the button is clicked       |

## Events

This component does not directly dispatch any events, but the `onClick` prop should be provided to handle click events.

## Accessibility

- Has `aria-label="Toggle navigation menu"` for screen readers
- Uses `aria-expanded` attribute to indicate current state
- Has `aria-controls="mobile-menu"` to associate with the controlled element

## Responsive Behavior

- Automatically hides on desktop screens (>= 1024px)
- Also hides when the mobile menu is active to avoid duplicate close buttons

## Animation

The component includes subtle animations for the hamburger lines when transitioning between states.

## Example

```svelte
<script>
	let mobileMenuOpen = false;

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
</script>

<header>
	<div class="logo">Site Logo</div>

	<HamburgerButton isActive={mobileMenuOpen} onClick={toggleMobileMenu} />

	<!-- Mobile menu implementation -->
	{#if mobileMenuOpen}
		<div id="mobile-menu">
			<!-- Menu content -->
		</div>
	{/if}
</header>
```

## CSS Variables

The component uses these CSS variables for styling:

- `--color-text` - Color of the hamburger lines
