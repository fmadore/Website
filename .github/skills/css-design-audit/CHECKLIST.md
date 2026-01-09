# CSS Design Audit Checklist

Use this checklist when reviewing Svelte components and CSS files for design system compliance.

## Quick Checks

### ✅ Colors
- [ ] No hardcoded hex colors (#1d4ed8, #14b8a6, etc.)
- [ ] Using semantic tokens (`--color-primary`, `--color-accent`)
- [ ] Transparency via `color-mix()` not `rgba()`
- [ ] Dark mode colors adapt correctly

### ✅ Spacing
- [ ] No hardcoded pixel values for margins/padding
- [ ] Using spacing scale (`--space-1` through `--space-24`)
- [ ] Following 8-point grid (4, 8, 12, 16, 24, 32, 48, 64...)
- [ ] Gap utilities use spacing tokens

### ✅ Typography
- [ ] Font sizes from scale (`--font-size-sm`, `--font-size-lg`)
- [ ] Using semantic font families (`--font-family-sans/serif/mono`)
- [ ] Line heights from tokens (`--line-height-normal`)
- [ ] Font weights from tokens (`--font-weight-semibold`)

### ✅ Glassmorphism
- [ ] Using utility classes (`.glass-card`, `.glass-panel`)
- [ ] Has `-webkit-backdrop-filter` fallback
- [ ] Borders use `color-mix()` for transparency
- [ ] Dark mode has appropriate adaptations

### ✅ Animations
- [ ] Using CSS classes not JavaScript (`scroll-reveal`, not `use:scrollAnimate`)
- [ ] Durations use tokens (`--duration-normal`)
- [ ] Easing uses tokens (`--ease-out`)
- [ ] Respects `prefers-reduced-motion`

### ✅ Accessibility
- [ ] Interactive elements have `:focus-visible` styles
- [ ] Focus ring uses `var(--focus-ring)`
- [ ] Color contrast meets WCAG AA (4.5:1 / 3:1)
- [ ] Touch targets are 44x44px minimum

### ✅ Media Queries
- [ ] Using PostCSS Custom Media (`@media (--md)`)
- [ ] NOT using `var()` in media queries
- [ ] Mobile-first approach (base → sm → md → lg)

## Common Replacements

```css
/* Colors */
#1d4ed8  →  var(--color-primary)
#14b8a6  →  var(--color-accent)
#f59e0b  →  var(--color-highlight)
#10b981  →  var(--color-success)
#dc2626  →  var(--color-danger)
#64748b  →  var(--color-secondary)

/* Spacing */
8px   →  var(--space-2)
16px  →  var(--space-4)
24px  →  var(--space-6)
32px  →  var(--space-8)
48px  →  var(--space-12)

/* Typography */
14px  →  var(--font-size-sm)
16px  →  var(--font-size-base)
18px  →  var(--font-size-lg)

/* Transitions */
200ms  →  var(--duration-normal)
300ms  →  var(--duration-slow)

/* Transparency */
rgba(0, 0, 0, 0.5)  →  color-mix(in srgb, var(--color-text) 50%, transparent)
```

## File-Specific Guidance

### Svelte Components (`*.svelte`)
1. Prefer utility classes over custom styles
2. Component-scoped styles for unique visuals only
3. Reference design tokens, never hardcode
4. Include proper TypeScript types for props

### Global CSS (`src/styles/**/*.css`)
1. Use semantic token names (`--color-primary` not `--sys-color-blue-700`)
2. Document new utilities in CSS-README.md
3. Follow existing naming conventions
4. Include responsive variants where appropriate

### Entity Cards / List Items
1. Use `.entity-*` classes from `entity-cards.css`
2. Combine with `.glass-card` for glass effects
3. Follow established grid patterns
4. Maintain visual parity across similar components

## Red Flags 🚩

- `style=` inline styles with hardcoded values
- `!important` declarations
- Deeply nested selectors (> 3 levels)
- Duplicate style definitions
- Missing browser prefixes for experimental features
- Fixed widths/heights that break responsiveness
- Z-index values not from the semantic scale
