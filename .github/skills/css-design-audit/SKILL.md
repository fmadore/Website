---
name: css-design-audit
description: Perform intelligent CSS design audits that go beyond pattern matching. Analyze semantic correctness, design coherence, accessibility implications, and architectural patterns. Use AI reasoning to evaluate context, identify meaningful issues, and provide actionable recommendations.
---

# CSS Design Audit Skill

This skill enables **intelligent design system auditing** that combines automated pattern detection with AI-powered reasoning to ensure CSS quality, consistency, and maintainability.

## Philosophy: Beyond Pattern Matching

This is NOT just a find-and-replace tool. You are a **design system consultant** who:

1. **Understands intent** - Why was this code written this way?
2. **Evaluates context** - Is a hardcoded value actually appropriate here?
3. **Reasons about semantics** - Is the right token being used for the right purpose?
4. **Considers architecture** - Should this pattern be extracted or consolidated?
5. **Thinks holistically** - How does this component fit the overall design language?

## When to Use This Skill

- **Component reviews**: Evaluate new or modified components for design quality
- **Design consistency audits**: Ensure visual coherence across similar components
- **Refactoring guidance**: Identify opportunities to consolidate patterns
- **Accessibility reviews**: Evaluate beyond checkbox compliance
- **Architecture decisions**: When to create utilities vs. component-scoped styles

## Audit Approach: Three-Layer Analysis

### Layer 1: Automated Detection (Quick Scan)

Run the automated script for initial pattern detection:

```bash
node .github/skills/css-design-audit/audit.mjs [path]
```

This catches obvious issues like:
- Hardcoded hex colors that match known tokens
- Pixel values on the 8-point grid
- Missing webkit prefixes
- Deprecated API usage

**Important**: Treat script output as a starting point, not the final answer.

### Layer 2: Contextual Reasoning (AI Analysis)

For each finding, apply intelligent reasoning:

#### Semantic Correctness
Ask: *"Is the RIGHT token being used for the RIGHT purpose?"*

| Scenario | Pattern Match Says | AI Should Reason |
|----------|-------------------|------------------|
| Blue used for "Cancel" button | ✅ Uses `--color-primary` | ❌ Should be `--color-secondary` or neutral - primary implies main action |
| Teal badge for "Error" state | ✅ Uses `--color-accent` | ❌ Should be `--color-danger` - semantic mismatch |
| 18px spacing (not on grid) | ❌ Not a token | ✓ May be intentional for optical alignment - evaluate context |
| `#333` in SVG icon | ❌ Hardcoded color | ✓ May be correct if icon needs fixed color for brand consistency |

#### Contextual Exceptions
Recognize when hardcoded values are acceptable:

- **1px borders**: Don't suggest `var(--space-0.25)` - borders are intentionally thin
- **SVG/icon colors**: May need fixed values for brand assets
- **Third-party overrides**: Sometimes you must match external library colors
- **Optical adjustments**: Designers sometimes break the grid for visual balance
- **Animation keyframes**: May need specific percentage values
- **Aspect ratios**: Values like `16/9` are standards, not magic numbers

#### Questions to Ask
1. What is this component's **purpose**? (Action, display, navigation, feedback?)
2. What **state** is being styled? (Default, hover, active, error, success?)
3. Does the token choice **communicate the right meaning**?
4. Is there a **similar component** that handles this differently?
5. Would a user with **accessibility needs** be impacted?

### Layer 3: Architectural Evaluation (Design Patterns)

Look beyond individual values to assess overall quality:

#### Code Organization
- **Too many custom properties?** (>15 unique values suggests extraction needed)
- **Duplicate patterns?** Check if similar styles exist in other components
- **Missed utility classes?** Could existing utilities replace custom CSS?
- **Overly specific selectors?** Deep nesting indicates coupling problems

#### Pattern Consolidation
When you see repeated patterns across components:
```css
/* If you see this in 3+ components... */
.component-card {
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  backdrop-filter: blur(12px);
  border-radius: var(--border-radius-lg);
  /* ... similar properties ... */
}
```
**Recommendation**: Extract to a shared utility or extend existing patterns in `entity-cards.css`

#### Component Comparison
Before flagging issues, check how similar components handle the same concern:
- How do other cards handle hover states?
- What focus patterns do other interactive elements use?
- Is this spacing consistent with sibling components?

## Token Reference (For Context, Not Mechanical Replacement)

Use these to understand the design system's vocabulary, not as a lookup table:

### Semantic Colors (Choose by Meaning)
| Token | Meaning | Use For |
|-------|---------|---------|
| `--color-primary` | Main brand action | Primary CTAs, active nav, key links |
| `--color-secondary` | Supporting/neutral | Secondary buttons, metadata, less emphasis |
| `--color-accent` | Highlight/distinction | Badges, tags, special callouts |
| `--color-highlight` | Attention/importance | Warnings, featured items, notifications |
| `--color-success` | Positive outcome | Confirmations, valid states, achievements |
| `--color-danger` | Error/destructive | Errors, delete actions, critical warnings |

### Spacing Philosophy (8-Point Grid)
The grid exists for **visual rhythm**, not rigid compliance:
- `--space-1` to `--space-4`: Tight, internal spacing (4px–16px)
- `--space-5` to `--space-8`: Standard component spacing (20px–32px)
- `--space-12` to `--space-24`: Section/layout spacing (48px–96px)
- **Tight variants**: `--space-md-tight` (14px), `--space-xl-tight` (28px) for in-between values

**Judgment call**: If a value like `18px` appears, ask why—it might be optical adjustment or a mistake.

### Typography Purpose
- Sizes communicate **hierarchy**, not just appearance
- `--font-size-sm` = de-emphasized, metadata
- `--font-size-base` = body content
- `--font-size-lg`+ = headings, emphasis

### Border Radius Scale
| Token | Value | Use For |
|-------|-------|---------|
| `--border-radius-xs` | 2px | Subtle rounding, badges |
| `--border-radius-sm` | 4px | Small elements, chips |
| `--border-radius` | 8px | Default, most UI elements |
| `--border-radius-md` | 10px | Cards, panels |
| `--border-radius-lg` | 12px | Larger cards, modals |
| `--border-radius-xl` | 16px | Hero sections, feature cards |
| `--border-radius-full` | 9999px | Circular elements, pills |

### Shadow Depth Scale
| Token | Use For |
|-------|---------|
| `--shadow-xs` | Subtle elevation, borders |
| `--shadow-sm` | Light cards, hover states |
| `--shadow` | Default card elevation |
| `--shadow-md` | Dropdowns, floating panels |
| `--shadow-lg` | Modals, major overlays |
| `--shadow-xl` | Hero elements, maximum depth |
| `--shadow-primary/accent/highlight` | Colored glow effects |
| `--shadow-glass` | Glassmorphism elements |

### Z-Index Semantic Scale
| Token | Value | Use For |
|-------|-------|---------|
| `--z-base` | 0 | Default stacking |
| `--z-above` | 1 | Slightly elevated |
| `--z-dropdown` | 1000 | Dropdown menus |
| `--z-sticky` | 1020 | Sticky headers |
| `--z-fixed` | 1030 | Fixed elements |
| `--z-modal-backdrop` | 1040 | Modal overlays |
| `--z-modal` | 1050 | Modal content |
| `--z-popover` | 1060 | Popovers, tooltips |
| `--z-tooltip` | 1070 | Tooltips |
| `--z-toast` | 1080 | Toast notifications |

## Accessibility: Beyond Checkboxes

Don't just check for presence of patterns—evaluate their effectiveness:

### Focus States
**Checkbox approach**: "Does it have `:focus-visible`?" ✓
**Intelligent approach**: 
- Is the focus indicator **visible enough** against the background?
- Does focus order make **logical sense**?
- Are focus styles **consistent** with similar interactive elements?

### Motion & Animation
**Checkbox approach**: "Does it check `prefers-reduced-motion`?" ✓
**Intelligent approach**:
- Is the animation **necessary** or purely decorative?
- Could this animation cause **vestibular issues**?
- Does the reduced-motion alternative still **convey the same information**?

### Color & Contrast
**Checkbox approach**: "Does it use semantic tokens?" ✓
**Intelligent approach**:
- Is there **sufficient contrast** for the specific context?
- Does the color choice work in **both light and dark modes**?
- Is color the **only** indicator, or is there redundant coding (icons, text)?

### Touch Targets
Don't just measure 44x44px—consider:
- Is there adequate **spacing between targets**?
- Do **hover states** have touch-friendly alternatives?
- Are **critical actions** easier to tap than destructive ones?

## Glassmorphism: Thoughtful Application

Glass effects are powerful but easily misused. Evaluate:

### When Glass Works
- Content overlaying complex backgrounds
- Elevated UI elements (modals, dropdowns)
- Creating depth hierarchy
- Light/dark mode transitions

### When Glass Fails
- Low-contrast text becomes unreadable
- Too many glass layers compete visually
- Performance on low-end devices
- Background provides insufficient blur contrast

### Required Pattern (When Appropriate)
```css
.glass-element {
  background: color-mix(in srgb, var(--color-surface) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px); /* Safari - REQUIRED */
  border: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
}
```

### Prefer Utility Classes
Check if existing utilities can be used instead of custom glass:
- `.glass-card`, `.glass-panel`, `.glass-button`
- `.glass-light`, `.glass-medium`, `.glass-heavy`

## Animation System Guidance

### CSS-Only Scroll Animations (Preferred)
```svelte
<section class="scroll-reveal">Fade up on scroll</section>
<div class="scroll-reveal-scale">Scale in on scroll</div>
<ul class="grid-stagger">Staggered children</ul>
```

### Deprecated JavaScript Approach
```svelte
<!-- DON'T USE - scrollAnimations.ts is deprecated -->
<div use:scrollAnimate={{ ... }}>
```

### Duration Semantics
| Token | Value | When to Use |
|-------|-------|-------------|
| `--duration-instant` | 75ms | Micro-interactions, toggles |
| `--duration-fast` | 150ms | Hover states, small UI feedback |
| `--duration-normal` | 200ms | Standard transitions |
| `--duration-moderate` | 300ms | Medium transitions, accordion reveals |
| `--duration-slow` | 500ms | Larger element movements |
| `--duration-slower` | 700ms | Page transitions, complex animations |

## Media Query Validation

### Correct: PostCSS Custom Media
```css
@media (--sm) { }  /* 640px */
@media (--md) { }  /* 768px */
@media (--lg) { }  /* 1024px */
```

### Invalid: CSS Variables in Media Queries
```css
/* BROKEN - var() doesn't work in media queries */
@media (min-width: var(--breakpoint-md)) { }
```

## Audit Output Format

Structure your findings by severity and actionability:

### 🔴 Critical (Must Fix)
- Accessibility failures
- Broken functionality
- Semantic errors (wrong token for purpose)

### 🟡 Recommended (Should Fix)
- Hardcoded values with clear token equivalents
- Missing browser prefixes
- Inconsistent patterns vs. similar components

### 🔵 Suggestions (Consider)
- Opportunities for consolidation
- Minor optimizations
- Documentation gaps

### ✅ Positive Observations
- Well-implemented patterns worth noting
- Good accessibility practices
- Consistent design language

### Example Output
```
📋 CSS Design Audit: ComponentName.svelte
═══════════════════════════════════════════

🔴 CRITICAL

  Line 45: Semantic mismatch
  Using `--color-primary` for cancel button action
  → The blue color implies "primary action" but this is a dismissive action
  → Recommendation: Use `--color-secondary` or a neutral variant

🟡 RECOMMENDED

  Line 67: Missing Safari fallback
  `backdrop-filter: blur(12px);`
  → Add: `-webkit-backdrop-filter: blur(12px);`

  Line 82: Hardcoded spacing
  `margin-bottom: 24px;`
  → This aligns with `--space-6` - recommend using token for maintainability

🔵 SUGGESTIONS

  Lines 45-78: Pattern duplication
  → This card styling closely matches `PublicationItem.svelte`
  → Consider extracting shared styles to `entity-cards.css`

✅ WELL DONE

  - Focus states properly implemented with `--focus-ring`
  - Respects `prefers-reduced-motion`
  - Consistent with sibling navigation components

Summary: 1 critical, 2 recommended, 1 suggestion
```

## Decision Framework

When unsure whether to flag an issue, ask:

1. **Impact**: Would fixing this improve UX, accessibility, or maintainability?
2. **Intent**: Did the developer likely make a conscious choice here?
3. **Consistency**: Does this deviate from established patterns without reason?
4. **Trade-offs**: Is there a valid reason for this approach?

**If you can't articulate why something should change, don't flag it.**

## Files Reference

- Design tokens: `src/styles/base/variables.css`
- CSS documentation: `src/styles/CSS-README.md`  
- Glass utilities: `src/styles/utilities/glassmorphism.css`
- Animation system: `src/styles/components/animations.css`
- Entity patterns: `src/styles/components/entity-cards.css`
