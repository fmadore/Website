# ReferencePreviewCard Component

An atomic component that displays a rich preview card for referenced publications or communications, with proper positioning.

## Import

```svelte
import ReferencePreviewCard from '$lib/components/reference/ReferencePreviewCard.svelte';
```

## Usage

```svelte
<ReferencePreviewCard
	item={publication}
	itemType="publication"
	referenceElement={spanElement}
	positionClass="position-below"
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
/>
```

## Props

| Prop               | Type                               | Default    | Description                                        |
| ------------------ | ---------------------------------- | ---------- | -------------------------------------------------- |
| `item`             | `Publication \| Communication`     | _required_ | The item data to display                           |
| `itemType`         | `'publication' \| 'communication'` | _required_ | The type of the referenced item                    |
| `referenceElement` | `HTMLElement \| null`              | `null`     | Reference to the parent element for positioning    |
| `positionClass`    | `string`                           | `''`       | CSS class for positioning ('' or 'position-below') |

## Callback props

| Prop             | Description                         |
| ---------------- | ----------------------------------- |
| `onpointerenter` | Called when pointer enters the card |
| `onpointerleave` | Called when pointer leaves the card |
| `onclose`        | Called when the card requests close |

## Features

- Smart positioning logic to ensure visibility on all screen sizes and devices
- Adjusts horizontal position to stay within viewport bounds on mobile
- Displays arrow that points to the reference element
- Shows rich information about the referenced item
- Automatic content formatting based on item type
- Responsive design with configurable width
