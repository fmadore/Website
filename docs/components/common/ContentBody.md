# ContentBody Component

The `ContentBody` component is a reusable container for main content areas that applies consistent glassmorphism effects, typography, and spacing using the global CSS variables. It's designed to provide a unified look and feel across all content-heavy pages on the website.

## Import

```svelte
import ContentBody from '$lib/components/common/ContentBody.svelte';
```

## Usage

### Basic Usage

```svelte
<ContentBody>
	{#snippet children()}
		<p>Your content goes here...</p>
		<p>Multiple paragraphs with consistent styling.</p>
	{/snippet}
</ContentBody>
```

### With Different Variants

```svelte
<!-- Default variant with glass-card effect -->
<ContentBody variant="default" glassEffect="glass-card">
	{#snippet children()}
		<p>Main content with standard padding and glassmorphism.</p>
	{/snippet}
</ContentBody>

<!-- Compact variant for smaller content areas -->
<ContentBody variant="compact" glassEffect="glass-light">
	{#snippet children()}
		<p>Compact content with reduced padding.</p>
	{/snippet}
</ContentBody>

<!-- Wide variant for expansive content -->
<ContentBody variant="wide" glassEffect="glass-panel">
	{#snippet children()}
		<p>Wide content with increased padding for emphasis.</p>
	{/snippet}
</ContentBody>
```

### With Additional Classes

```svelte
<ContentBody 
	variant="default" 
	glassEffect="glass-card" 
	additionalClasses="md:col-span-2 mb-12"
>
	{#snippet children()}
		<p>Content with additional CSS classes for layout.</p>
	{/snippet}
</ContentBody>
```

## Props

| Prop               | Type                                                          | Default      | Description                                    |
| ------------------ | ------------------------------------------------------------- | ------------ | ---------------------------------------------- |
| `variant`          | `'default' \| 'compact' \| 'wide'`                           | `'default'`  | Controls padding and spacing                   |
| `glassEffect`      | `'glass-card' \| 'glass-panel' \| 'glass-medium' \| 'glass-light'` | `'glass-card'` | Glassmorphism effect to apply                  |
| `additionalClasses` | `string`                                                      | `''`         | Additional CSS classes to apply                |
| `children`         | `snippet`                                                     | _required_   | Content to render inside the component         |

## Variants

### Default
- Standard padding (`var(--spacing-8)`)
- Standard margin bottom (`var(--spacing-8)`)
- Best for main content areas

### Compact
- Reduced padding (`var(--spacing-6)`)
- Reduced margin bottom (`var(--spacing-6)`)
- Best for sidebar content or smaller sections

### Wide
- Increased padding (`var(--spacing-10)`)
- Increased margin bottom (`var(--spacing-10)`)
- Best for hero sections or emphasized content

## Glass Effects

The component supports all glassmorphism utilities from your CSS framework:

- **`glass-card`**: Standard glass effect with moderate blur and transparency
- **`glass-panel`**: Enhanced glass effect for panels
- **`glass-medium`**: Medium intensity glass effect
- **`glass-light`**: Subtle glass effect

## Features

### Typography Styling
- **Paragraphs**: Consistent spacing, line height, and color using CSS variables
- **Links**: Primary color with hover effects and external link indicators
- **Emphasis**: Proper styling for `<em>` and `<strong>` elements
- **Lead paragraphs**: First paragraph gets enhanced styling (larger font size)
- **Headings**: Serif font family with proper hierarchy (h2, h3)

### Content Elements
- **Lists**: Proper spacing and indentation for `<ul>` and `<ol>`
- **Blockquotes**: Styled with primary color accent and background
- **Code**: Inline and block code styling with monospace font
- **Images**: Responsive images with rounded corners

### Responsive Design
- Mobile-first approach with responsive padding
- Font size adjustments for smaller screens
- Maintains readability across all device sizes

### Dark Mode Support
- Automatic dark mode adaptation through CSS variables
- No additional configuration needed

### Accessibility
- Proper color contrast ratios
- Semantic HTML structure
- Respects user motion preferences

## CSS Variables Used

The component leverages your comprehensive CSS variable system:

### Spacing
- `--spacing-1` through `--spacing-10` for consistent spacing
- `--border-radius-lg`, `--border-radius`, `--border-radius-sm` for rounded corners

### Typography
- `--font-family-serif`, `--font-family-mono` for font families
- `--font-size-sm` through `--font-size-2xl` for font sizes
- `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold` for weights
- `--line-height-relaxed` for optimal reading experience

### Colors
- `--color-text`, `--color-text-light`, `--color-text-emphasis` for text colors
- `--color-primary`, `--color-primary-dark`, `--color-primary-rgb` for links and accents
- `--color-code-bg` for code backgrounds

### Effects
- `--transform-lift-sm` for hover effects
- `--opacity-high` for external link indicators

## Examples

### Homepage Main Content
```svelte
<ContentBody variant="default" glassEffect="glass-card" additionalClasses="md:col-span-2">
	{#snippet children()}
		<p>I am a Research Fellow at...</p>
		<p>My recent book, <em>Religious Activism on Campuses</em>...</p>
	{/snippet}
</ContentBody>
```

### Research Project Content
```svelte
<ContentBody variant="wide" glassEffect="glass-panel">
	{#snippet children()}
		<h2>Project Overview</h2>
		<p>This research project explores...</p>
		<h3>Methodology</h3>
		<p>Using digital humanities methods...</p>
	{/snippet}
</ContentBody>
```

### Sidebar Content
```svelte
<ContentBody variant="compact" glassEffect="glass-light">
	{#snippet children()}
		<h3>Quick Links</h3>
		<ul>
			<li><a href="/research">Research</a></li>
			<li><a href="/publications">Publications</a></li>
		</ul>
	{/snippet}
</ContentBody>
```

## Benefits

1. **Consistency**: Ensures uniform styling across all content areas
2. **Maintainability**: Centralized styling makes updates easy
3. **Accessibility**: Built-in accessibility features and proper contrast
4. **Performance**: Leverages CSS variables for efficient theming
5. **Flexibility**: Multiple variants and customization options
6. **Modern Design**: Beautiful glassmorphism effects with proper fallbacks
7. **Responsive**: Mobile-first design that works on all devices
8. **Dark Mode**: Automatic dark mode support without additional code

## Best Practices

1. Use `variant="default"` for most main content areas
2. Use `variant="compact"` for sidebar or secondary content
3. Use `variant="wide"` for hero sections or emphasized content
4. Choose glass effects that match the content importance:
   - `glass-card` for main content
   - `glass-light` for subtle secondary content
   - `glass-panel` for important highlighted content
5. Use `additionalClasses` for layout-specific styling (grid columns, margins, etc.)
6. Keep content semantic with proper heading hierarchy
7. Test with both light and dark themes 