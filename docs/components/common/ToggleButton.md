# ToggleButton Component

A button component that toggles between two states (e.g., show/hide) with appropriate text and icon.

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

| Prop        | Type      | Default    | Description                                       |
| ----------- | --------- | ---------- | ------------------------------------------------- |
| `isToggled` | `boolean` | `false`    | Current toggle state                              |
| `baseText`  | `string`  | `'Toggle'` | Base text for the action (e.g., "Map", "Details") |

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
