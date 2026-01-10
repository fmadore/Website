# ToggleButton Component

A reusable toggle button component that shows/hides content with visual state feedback and accessibility features. The component features enhanced glassmorphism styling, dynamic button variants, and seamless integration with the design system.

## Import

```svelte
import ToggleButton from '$lib/components/common/ToggleButton.svelte';
```

## Usage

```svelte
<script>
	import ToggleButton from '$lib/components/common/ToggleButton.svelte';

	let showMap = false;

	function handleToggle() {
		showMap = !showMap;
		// Additional logic to show/hide map
	}
</script>

<ToggleButton isToggled={showMap} baseText="Map" on:toggle={handleToggle} />
```

## Props

| Prop        | Type         | Default     | Description                                                  |
| ----------- | ------------ | ----------- | ------------------------------------------------------------ |
| `isToggled` | `boolean`    | `false`     | Whether the button is in the toggled (active) state          |
| `baseText`  | `string`     | `'Toggle'`  | The base text for the toggle action (e.g., "Map", "Details") |
| `onclick`   | `() => void` | `undefined` | Callback function called when button is clicked              |
| `glass`     | `boolean`    | `true`      | Enable glassmorphism effect for enhanced visual appeal       |

## Events

| Event    | Detail | Description                      |
| -------- | ------ | -------------------------------- |
| `toggle` | `{}`   | Fired when the button is clicked |

## State-Based Text

The component automatically adjusts its text based on the toggle state:

- When `isToggled` is `false`: Shows "Show [baseText]" (e.g., "Show Map")
- When `isToggled` is `true`: Shows "Hide [baseText]" (e.g., "Hide Map")

## Icons

The component uses a Map icon from Lucide by default. The icon is included in the button using the Button component's icon slot.

## Accessibility

- Provides dynamic `aria-label` based on current toggle state
- Includes `title` attribute for tooltip information on hover
- Uses the Button atom component which ensures keyboard accessibility

## Customization

This component uses the common Button atom component with an "outline-primary" variant. It applies additional global CSS classes for styling:

- `.control-button-rounded` - Adds rounded corners
- Custom hover state styling for consistent visual feedback

## Example Use Cases

- Toggle between map and list views
- Show/hide additional details in a component
- Enable/disable advanced features
- Show/hide filters or sidebars

## Example with Custom Handling

```svelte
<script>
	import ToggleButton from '$lib/components/common/ToggleButton.svelte';
	import { mapVisible } from '$lib/stores/uiState.js';

	function toggleMap() {
		mapVisible.update((value) => !value);
	}
</script>

<ToggleButton isToggled={$mapVisible} baseText="Map View" on:toggle={toggleMap} />
```

## Features

- **Dynamic Button Variants**: Automatically switches between `outline-primary` (inactive) and `primary` (active) variants
- **Visual State Feedback**: Clear indication of toggled/untoggled state with proper color contrast
- **State-Based Text**: Automatically shows "Show [baseText]" or "Hide [baseText]" based on toggle state
- **Enhanced Glassmorphism**: Integrates seamlessly with the design system's glass effects
- **Accessibility**: Proper ARIA labels, keyboard navigation, and screen reader support
- **Consistent Styling**: Uses CSS variables and follows the established design patterns

## Styling

The component uses several CSS classes for enhanced styling:

### Primary Classes

- `.toggle-button` - Base styling with CSS variables integration
- `.toggle-button-active` - Active state styling when toggled
- `.glass-button` - Glassmorphism effect (when `glass={true}`)

### Features

- **CSS Variables**: Uses design tokens like `--border-radius-lg`, `--shadow-sm`, `--duration-normal`
- **Glassmorphism**: Backdrop blur with `--glass-blur-amount` and subtle gradients
- **Hover Effects**: Transform lift with `--transform-lift-sm` and enhanced shadows
- **Active States**: Scale transform with `--scale-95` for press feedback
- **State Transitions**: Smooth transitions between toggled/untoggled states
- **Dark Mode**: Automatic color scheme adaptation
- **Accessibility**: Respects `prefers-reduced-motion` setting

## Visual Design

### Untoggled State

- Outline primary button style
- Glassmorphism background with subtle gradient
- Icon: `lucide:map` (configurable in future versions)
- Text: "Show {baseText}"

### Toggled State

- Filled primary button style
- Solid background with gradient overlay
- Enhanced shadow and glow effect
- Text: "Hide {baseText}"

### Hover Effects

- Subtle lift transform
- Enhanced shadow depth
- Gradient intensity increase
- Smooth transitions

## Accessibility Features

- **ARIA Labels**: Dynamic labels that describe the current action
- **Keyboard Navigation**: Full keyboard support through Button component
- **Screen Reader Support**: Clear descriptions of toggle state changes
- **Focus Management**: Visible focus indicators with proper contrast
- **Semantic HTML**: Uses proper button semantics
- **Reduced Motion**: Animations disabled when user prefers reduced motion

## Integration Examples

### Map Toggle

```svelte
<script>
	let showMap = false;
</script>

<ToggleButton isToggled={showMap} baseText="Map" onclick={() => (showMap = !showMap)} />
```

### Filter Panel Toggle

```svelte
<script>
	let showFilters = false;
</script>

<ToggleButton
	isToggled={showFilters}
	baseText="Filters"
	onclick={() => (showFilters = !showFilters)}
/>
```

### Details Section Toggle

```svelte
<script>
	let showDetails = false;
</script>

<ToggleButton
	isToggled={showDetails}
	baseText="Details"
	onclick={() => (showDetails = !showDetails)}
/>
```

## Technical Notes

- Built on top of the `Button` component for consistent styling and behavior
- Uses Svelte 5 syntax with `$props()` and `$derived()`
- Integrates with the global CSS design system
- Supports both light and dark themes
- Optimized for performance with efficient reactivity
- Future enhancement: Configurable icons

## Comparison with Sorter

While both components use the Button component, they serve different purposes:

| Feature  | ToggleButton       | Sorter                 |
| -------- | ------------------ | ---------------------- |
| Purpose  | Show/hide content  | Change sort order      |
| States   | 2 (show/hide)      | 3+ (different sorts)   |
| Behavior | Toggle on/off      | Cycle through options  |
| Visual   | Active/inactive    | Current sort indicator |
| Use Case | Content visibility | List ordering          |
