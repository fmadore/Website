# CSS Design Audit Checklist

This checklist guides **intelligent review** of Svelte components and CSS files. It's organized around reasoning, not just pattern detection.

## Audit Philosophy

Before checking boxes, ask:
1. **Does this serve the user?** (Accessibility, usability, performance)
2. **Does this serve the team?** (Maintainability, consistency, clarity)
3. **Is there a good reason for deviation?** (Context matters more than rules)

---

## 🎨 Semantic Correctness (Most Important)

These require **reasoning**, not pattern matching:

### Color Semantics
- [ ] Primary color (`--color-primary`) used only for **main actions** and active states
- [ ] Secondary color used for **supporting** actions, not competing with primary
- [ ] Accent color represents **distinction**, not errors or warnings
- [ ] Danger color used for **destructive actions and errors**, not emphasis
- [ ] Success color used for **positive outcomes**, not generic highlights

**Ask yourself**: *If I swap this color token, does the meaning change incorrectly?*

### State Semantics
- [ ] Hover states provide **feedback**, not just decoration
- [ ] Active states visually **confirm** interaction
- [ ] Disabled states are **clearly** non-interactive (not just grayed)
- [ ] Error states **stand out** from normal content

### Typography Semantics
- [ ] Heading levels reflect **actual document hierarchy** (not just size preference)
- [ ] Emphasis (`strong`, `em`) used for **meaning**, not styling
- [ ] Font size choices communicate **relative importance**

---

## ♿ Accessibility (Critical Path)

These have real user impact:

### Focus Management
- [ ] **All** interactive elements have visible `:focus-visible` states
- [ ] Focus indicators are visible against **all backgrounds** they appear on
- [ ] Focus order follows **logical reading sequence**
- [ ] Custom focus styles use `var(--focus-ring)` for consistency

### Motion & Animation
- [ ] Animations respect `@media (--reduced-motion)` or `prefers-reduced-motion`
- [ ] Essential information **not conveyed solely through animation**
- [ ] Auto-playing animations can be **paused or stopped**
- [ ] No animations that could trigger **vestibular issues** (large parallax, zoom effects)

### Color & Contrast
- [ ] Text meets **WCAG AA contrast** (4.5:1 normal, 3:1 large text)
- [ ] Information not conveyed by **color alone** (icons, patterns, text as backup)
- [ ] Components work in **both light and dark modes**
- [ ] Interactive elements have **hover/focus** state changes beyond color

### Touch & Interaction
- [ ] Touch targets are **at least 44×44px** (or have adequate spacing)
- [ ] Spacing between targets prevents **accidental activation**
- [ ] Critical actions are **harder to accidentally trigger** than cancel actions

---

## 🏗️ Technical Patterns (Secondary)

These are about maintainability—flag with judgment:

### Design Token Usage
- [ ] Colors use semantic tokens—but **evaluate if the right token** for the context
- [ ] Spacing aligns with 8-point grid—but **allow optical adjustments** when intentional
- [ ] Typography uses scale—but understand **size communicates hierarchy**
- [ ] Transitions use duration tokens for **consistent motion feel**

### Acceptable Exceptions (Don't Flag These)
- `1px` borders (intentionally thin, not a spacing value)
- Colors in SVGs/icons that need fixed brand values
- Third-party library overrides
- Optical spacing adjustments with clear rationale
- Animation keyframe percentages

### Glassmorphism Patterns
- [ ] Has `-webkit-backdrop-filter` fallback (Safari support)
- [ ] Uses `color-mix()` for transparency, not `rgba()`
- [ ] Dark mode has appropriate adaptations
- [ ] Consider: **Is glass appropriate here?** (readability, performance)

### Media Queries
- [ ] Uses PostCSS Custom Media (`@media (--md)`)
- [ ] NOT using `var()` inside media queries (invalid CSS)
- [ ] Mobile-first approach (base → sm → md → lg)

---

## 🔍 Architectural Observations

Look for patterns, not just individual issues:

### Code Organization
- [ ] Component has < 15 custom CSS properties (otherwise extract shared patterns)
- [ ] No deeply nested selectors (> 3 levels indicates coupling)
- [ ] No `!important` declarations (indicates specificity problems)
- [ ] No duplicate style definitions within the file

### Pattern Reuse
- [ ] Check if similar components handle this concern differently (inconsistency?)
- [ ] Check if existing utility classes could replace custom CSS
- [ ] Consider if this pattern should be **extracted** to shared CSS
- [ ] For cards/lists: Consider using `entity-cards.css` patterns

### Browser Compatibility
- [ ] Experimental features have fallbacks
- [ ] No assumptions about specific viewport sizes
- [ ] Responsive behavior tested conceptually

---

## 📝 Quick Reference: Common Replacements

Use this for **reference**, not mechanical find-replace:

```css
/* Colors - choose by MEANING, not just hex match */
#1d4ed8  →  var(--color-primary)      /* Main actions */
#14b8a6  →  var(--color-accent)       /* Highlights, badges */
#f59e0b  →  var(--color-highlight)    /* Attention, featured */
#10b981  →  var(--color-success)      /* Positive states */
#dc2626  →  var(--color-danger)       /* Errors, destructive */
#64748b  →  var(--color-secondary)    /* Supporting elements */
#1e293b  →  var(--color-text)         /* Main text */

/* Spacing - 8-point grid */
4px   →  var(--space-1)
8px   →  var(--space-2)
12px  →  var(--space-3)
16px  →  var(--space-4)
20px  →  var(--space-5)
24px  →  var(--space-6)
28px  →  var(--space-7) / var(--space-xl-tight)
32px  →  var(--space-8)
48px  →  var(--space-12)
64px  →  var(--space-16)

/* Border Radius */
2px   →  var(--border-radius-xs)
4px   →  var(--border-radius-sm)
8px   →  var(--border-radius)         /* default */
10px  →  var(--border-radius-md)
12px  →  var(--border-radius-lg)
16px  →  var(--border-radius-xl)
20px  →  var(--border-radius-2xl)
24px  →  var(--border-radius-3xl)

/* Z-Index - use semantic scale */
1000  →  var(--z-dropdown)
1020  →  var(--z-sticky)
1030  →  var(--z-fixed)
1040  →  var(--z-modal-backdrop)
1050  →  var(--z-modal)
1060  →  var(--z-popover)
1070  →  var(--z-tooltip)
1080  →  var(--z-toast)

/* Shadows - use token scale */
box-shadow: 0 1px 2px...   →  var(--shadow-xs)
box-shadow: 0 1px 3px...   →  var(--shadow-sm)
box-shadow: 0 4px 6px...   →  var(--shadow)
box-shadow: 0 10px 15px... →  var(--shadow-md)
box-shadow: 0 20px 25px... →  var(--shadow-lg)
box-shadow: 0 25px 50px... →  var(--shadow-xl)

/* Transitions - duration tokens */
75ms   →  var(--duration-instant)
150ms  →  var(--duration-fast)
200ms  →  var(--duration-normal)
300ms  →  var(--duration-moderate)
500ms  →  var(--duration-slow)
700ms  →  var(--duration-slower)

/* Easing functions */
cubic-bezier(0.4, 0, 1, 1)       →  var(--ease-in)
cubic-bezier(0, 0, 0.2, 1)       →  var(--ease-out)
cubic-bezier(0.4, 0, 0.2, 1)     →  var(--ease-in-out)
cubic-bezier(0.34, 1.56, 0.64, 1) →  var(--ease-bounce)

/* Transparency */
rgba(...)  →  color-mix(in srgb, var(--color-*) 50%, transparent)
```

---

## 🚩 Red Flags (Always Investigate)

These usually indicate problems:

- **Inline `style=` attributes** with hardcoded values
- **`!important` declarations** (specificity war signs)
- **Deeply nested selectors** (> 3 levels)
- **Duplicate style definitions** (copy-paste errors)
- **Fixed widths/heights** that break responsiveness
- **Z-index values** not from semantic scale
- **Color used as only differentiator** (accessibility issue)

---

## ✅ Positive Patterns (Note These)

When something is done well, mention it:

- Proper use of `var(--focus-ring)` for focus states
- Respects `prefers-reduced-motion`
- Consistent with sibling components
- Good semantic token choices
- Clear separation of concerns
- Appropriate use of utility classes
