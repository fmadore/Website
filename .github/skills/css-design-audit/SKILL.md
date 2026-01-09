---
name: css-design-audit
description: Audit CSS usage in Svelte components to ensure design consistency. Detects hardcoded values that should use design tokens, validates glassmorphism patterns, checks accessibility compliance, and updates CSS documentation. Use when reviewing components, refactoring styles, or checking design system adherence.
---

# CSS Design Audit Skill

This skill helps ensure CSS design consistency across the codebase by auditing Svelte components and CSS files for proper use of the design system.

## When to Use This Skill

- Reviewing or creating new Svelte components
- Refactoring existing styles
- Checking design system adherence
- Updating CSS documentation
- Performing design audits before releases

## Core Responsibilities

### 1. Detect Hardcoded Values

Scan for values that should use CSS variables from `src/styles/base/variables.css`:

**Colors to flag:**
- Hex colors (e.g., `#1d4ed8`, `#14b8a6`, `#f59e0b`)
- RGB/RGBA values (e.g., `rgb(29, 78, 216)`)
- HSL values
- Named colors in critical contexts

**Replace with semantic tokens:**
| Hardcoded | Should Use |
|-----------|------------|
| `#1d4ed8`, `blue-700` | `var(--color-primary)` |
| `#14b8a6`, `teal-500` | `var(--color-accent)` |
| `#f59e0b`, `amber-500` | `var(--color-highlight)` |
| `#10b981`, `emerald-500` | `var(--color-success)` |
| `#dc2626`, `red-600` | `var(--color-danger)` |
| `#64748b`, `slate-500` | `var(--color-secondary)` |

**Spacing to flag:**
- Pixel values for margins/padding (e.g., `16px`, `24px`, `32px`)
- Em values that don't reference the scale

**Replace with spacing tokens:**
| Hardcoded | Should Use |
|-----------|------------|
| `4px`, `0.25rem` | `var(--space-1)` |
| `8px`, `0.5rem` | `var(--space-2)` |
| `12px`, `0.75rem` | `var(--space-3)` |
| `16px`, `1rem` | `var(--space-4)` |
| `24px`, `1.5rem` | `var(--space-6)` |
| `32px`, `2rem` | `var(--space-8)` |
| `48px`, `3rem` | `var(--space-12)` |

**Typography to flag:**
- Font sizes not using the scale
- Hardcoded font families
- Fixed line heights

**Replace with typography tokens:**
| Hardcoded | Should Use |
|-----------|------------|
| `14px`, `0.875rem` | `var(--font-size-sm)` |
| `16px`, `1rem` | `var(--font-size-base)` |
| `18px`, `1.125rem` | `var(--font-size-lg)` |
| Font stacks | `var(--font-family-sans/serif/mono)` |

### 2. Validate Glassmorphism Usage

Check that glassmorphism effects follow established patterns:

**Required properties for glass effects:**
```css
/* Correct pattern */
.glass-card {
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari fallback */
  border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
}
```

**Available glass utility classes:**
- `.glass-card` - Cards with hover effects
- `.glass-panel` - Panels and sidebars
- `.glass-button` - Buttons
- `.glass-light`, `.glass-medium`, `.glass-heavy` - Intensity variants

**Common mistakes:**
- Missing `-webkit-backdrop-filter` fallback
- Using `rgba()` instead of `color-mix()` for transparency
- Hardcoded blur values instead of design tokens

### 3. Check Animation Patterns

Ensure animations follow the CSS-only system:

**Preferred (CSS scroll animations):**
```svelte
<section class="scroll-reveal">...</section>
<div class="card scroll-reveal-scale">...</div>
<ul class="grid-stagger">{#each items}<li>...</li>{/each}</ul>
```

**Deprecated (JavaScript-based):**
```svelte
<!-- DON'T USE: scrollAnimations.ts is deprecated -->
<div use:scrollAnimate={{ animationClass: 'scale-in' }}>
```

**Animation tokens to use:**
| Hardcoded | Should Use |
|-----------|------------|
| `75ms` | `var(--duration-instant)` |
| `150ms` | `var(--duration-fast)` |
| `200ms` | `var(--duration-normal)` |
| `300ms` | `var(--duration-slow)` |
| `500ms` | `var(--duration-slower)` |

### 4. Accessibility Compliance

Check for accessibility requirements:

**Focus indicators:**
```css
/* Correct pattern */
.interactive:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
```

**Reduced motion support:**
```css
@media (--reduced-motion) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

**Color contrast:**
- Text on backgrounds should meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Use semantic color tokens which are designed for proper contrast

### 5. Media Query Validation

**Correct usage (PostCSS Custom Media):**
```css
@media (--sm) { /* 640px */ }
@media (--md) { /* 768px */ }
@media (--lg) { /* 1024px */ }
```

**Invalid (CSS variables in media queries):**
```css
/* DON'T USE: var() is invalid in media queries */
@media (min-width: var(--breakpoint-md)) { }
```

## Audit Procedure

### Step 1: Identify Files to Audit

```bash
# Find all Svelte components
find src -name "*.svelte" -type f

# Find all CSS files
find src/styles -name "*.css" -type f
```

### Step 2: Run Pattern Checks

For each file, check for:

1. **Hardcoded colors** - Regex: `#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\(`
2. **Hardcoded spacing** - Regex: `\d+px|\d+\.?\d*rem(?!.*var)`
3. **Missing focus states** - Check `:focus-visible` on interactive elements
4. **Missing motion preferences** - Check for `prefers-reduced-motion`

### Step 3: Generate Report

Create a structured report with:
- File path
- Line number
- Issue type (hardcoded color, spacing, etc.)
- Current value
- Suggested replacement

### Step 4: Update CSS Documentation

If new patterns or tokens are identified, update:
- `src/styles/CSS-README.md` - Add new patterns or clarifications
- `src/styles/base/variables.css` - Add missing tokens if needed

## Quick Reference: Design Token Categories

### Colors
```css
--color-primary, --color-primary-dark, --color-primary-light
--color-secondary, --color-secondary-light
--color-accent, --color-accent-dark, --color-accent-light
--color-highlight, --color-highlight-dark, --color-highlight-light
--color-success, --color-success-dark
--color-danger, --color-danger-dark, --color-danger-light
--color-text, --color-text-light, --color-text-muted
--color-background, --color-surface, --color-border
```

### Spacing (8-point grid)
```css
--space-1 (4px), --space-2 (8px), --space-3 (12px), --space-4 (16px)
--space-5 (20px), --space-6 (24px), --space-8 (32px), --space-10 (40px)
--space-12 (48px), --space-16 (64px), --space-20 (80px), --space-24 (96px)
```

### Typography
```css
--font-size-xs, --font-size-sm, --font-size-base, --font-size-lg
--font-size-xl, --font-size-2xl, --font-size-3xl, --font-size-4xl
--font-family-sans, --font-family-serif, --font-family-mono
--font-weight-normal, --font-weight-medium, --font-weight-semibold, --font-weight-bold
--line-height-tight, --line-height-normal, --line-height-relaxed
```

### Effects
```css
--shadow-xs, --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
--border-radius-sm, --border-radius-md, --border-radius-lg, --border-radius-full
--duration-instant, --duration-fast, --duration-normal, --duration-slow
--ease-in, --ease-out, --ease-in-out, --ease-bounce
```

## Example Audit Output

```
📋 CSS Design Audit Report
==========================

File: src/lib/components/example/Card.svelte
Line 45: Hardcoded color #1d4ed8
  → Replace with: var(--color-primary)

Line 52: Hardcoded spacing 16px
  → Replace with: var(--space-4)

Line 67: Missing -webkit-backdrop-filter fallback
  → Add: -webkit-backdrop-filter: blur(12px);

Line 89: Animation uses deprecated scrollAnimations.ts
  → Replace with: class="scroll-reveal"

File: src/lib/components/example/Button.svelte
Line 23: Missing focus-visible state
  → Add: box-shadow: var(--focus-ring);

Summary: 5 issues found in 2 files
  - 2 hardcoded colors
  - 1 hardcoded spacing
  - 1 missing browser fallback
  - 1 deprecated animation pattern
```

## Integration with Svelte MCP

When this skill is activated alongside Svelte development:

1. After writing component code, run the CSS audit
2. Use `svelte-autofixer` to validate Svelte 5 syntax
3. Apply design token replacements
4. Verify changes with another audit pass

## Files Reference

Key files for the design system:
- [variables.css](../../../src/styles/base/variables.css) - All design tokens
- [CSS-README.md](../../../src/styles/CSS-README.md) - Full documentation
- [glassmorphism.css](../../../src/styles/utilities/glassmorphism.css) - Glass utilities
- [animations.css](../../../src/styles/components/animations.css) - Animation system
