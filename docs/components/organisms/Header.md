# Header Component

The Header is a complex organism component that provides the main navigation interface for the website. It combines desktop and mobile navigation systems, integrating multiple molecules and atoms to create a responsive header that works across all device sizes.

## Import

```svelte
import Header from '$lib/components/organisms/Header.svelte';
```

## Usage

```svelte
<Header />
```

This component doesn't accept any props as it's designed to be used as a standalone organism that manages its own state.

## Component Composition

The Header organism combines:

- **Molecules:**
  - `DesktopNav` - For navigation on desktop devices
  - `MobileMenu` - For navigation on mobile devices

- **Atoms:**
  - `HamburgerButton` - Toggle for the mobile menu
  - `ThemeToggle` - For switching between light and dark themes

## State Management

The Header manages several types of state:

1. **Mobile Menu State:**
   - Controls the visibility of the mobile menu
   - Manages body overflow to prevent scrolling when mobile menu is open

2. **Dropdown State:**
   - Tracks which dropdown menu is currently active
   - Implements delay timers for better UX when hovering dropdowns
   - Handles keyboard navigation for dropdowns

3. **DOM Event Management:**
   - Implements global click handlers to close menus when clicking outside
   - Manages window resize events to handle responsive behavior

## Key Features

- **Responsive Design:** Adapts between mobile and desktop layouts based on screen width
- **Keyboard Navigation:** Full keyboard accessibility for all navigation elements
- **Hover Intent:** Smart dropdown behavior that prevents accidental triggers
- **Click Outside:** Closes menus when clicking outside their boundaries
- **Sticky Positioning:** Stays at the top of the viewport while scrolling

## Lifecycle Management

The Header component:

- Sets up event listeners on mount
- Cleans up event listeners and timers on unmount
- Manages body scroll state correctly when the component is destroyed

## Event Handling

The component implements several sophisticated event handling patterns:

1. **Dropdown Management:**

   ```typescript
   function showDropdown(index: number) {
   	// Clear any pending hide timers
   	if (dropdownTimer) {
   		clearTimeout(dropdownTimer);
   		dropdownTimer = null;
   	}
   	activeDropdown = index;
   }

   function startHideTimer() {
   	if (dropdownTimer) {
   		clearTimeout(dropdownTimer);
   	}
   	dropdownTimer = setTimeout(() => {
   		activeDropdown = null;
   		dropdownTimer = null;
   	}, HIDE_DELAY);
   }
   ```

2. **Mobile Menu Toggle:**

   ```typescript
   function toggleMobileMenu() {
   	mobileMenuOpen = !mobileMenuOpen;

   	// Toggle body scroll blocking
   	if (mobileMenuOpen) {
   		document.body.style.overflow = 'hidden';
   		bodyOverflowHidden = true;
   	} else {
   		document.body.style.overflow = '';
   		bodyOverflowHidden = false;
   	}
   }
   ```

3. **Click Outside Detection:**

   ```typescript
   function handleClickOutside(event: MouseEvent) {
   	const target = event.target as HTMLElement;

   	// Close mobile menu if clicked outside
   	if (
   		mobileMenuOpen &&
   		target &&
   		!target.closest('.mobile-nav-container') &&
   		!target.closest('.hamburger')
   	) {
   		closeMobileMenu();
   	}

   	// Close dropdown if clicked outside
   	if (activeDropdown !== null && target && !target.closest('.dropdown-container')) {
   		activeDropdown = null;
   	}
   }
   ```

## Styling

The Header uses a clean, minimal design with:

- Subtle hover and focus effects
- Box shadow for depth
- Smooth transitions for state changes
- Proper z-indexing to ensure it appears above page content

## Accessibility

- Proper ARIA attributes for navigation menus and buttons
- Keyboard navigation support for all interactive elements
- Focus management between navigation items and dropdowns
- Appropriate screen reader labels

## Example

```svelte
<!-- Layout.svelte -->
<script>
	import Header from '$lib/components/organisms/Header.svelte';
	import Footer from '$lib/components/common/Footer.svelte';
</script>

<div class="site-layout">
	<Header />

	<main>
		<slot />
	</main>

	<Footer />
</div>
```

## CSS Variables

The component uses these CSS variables for styling:

- `--color-background` - Background color of the header
- `--color-text` - Text color for navigation items
- `--shadow` - Box shadow for the header
- `--shadow-md` - Box shadow for hover state
- `--spacing-4` - Standard padding
- `--spacing-6` - Larger padding for wider screens
