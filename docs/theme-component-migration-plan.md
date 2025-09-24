# Component migration plan for the refreshed design tokens

The global token refactor introduces foundation/semantic layers, fluid typography, and a normalized spacing scale. The steps below stage the component work so updates are predictable and low-risk.

## 1. Audit the current usage map
- Extract a token usage report from the code base (e.g. via `rg -- '--spacing-'` and `rg -- '--color-'`).
- Tag each usage with the new semantic token it should adopt (interactive, surface, text, etc.).
- Catalogue utilities/components that still depend on legacy aliases (`--spacing-*`, `--color-primary`, `--card-*`).

## 2. Update layout primitives
- Migrate layout CSS (`grid`, `container`, utilities) to consume the semantic spacing tokens (`--space-*`, `--layout-page-gutter`).
- Replace hard-coded dimensions in layout components with the new container and stack tokens so responsive rhythm remains consistent.
- Introduce responsive helper classes where needed so downstream components do not reintroduce bespoke spacing.

## 3. Refresh interactive components
- Buttons, links, and navigation patterns should pivot to `--color-interactive`, `--color-accent`, and motion shorthands (`--transition-snappy`).
- Normalize focus outlines to the new `--focus-ring-*` tokens, ensuring WCAG contrast in both light and dark themes.
- Replace card and panel glassmorphism variables with the shared `--glass-*` tokens; retire the scoped `--card-*` aliases once all call sites are updated.

## 4. Typography and prose adjustments
- Update component-level headings/lead text to reference the new heading tokens (`--heading-*`) instead of bespoke font declarations.
- Ensure long-form content containers respect the `--text-measure-*` constraints and fluid font sizes.
- Revisit link overrides to remove hard-coded colors in favour of `--color-link` and `--color-link-hover`.

## 5. Remove legacy aliases and dead tokens
- After component migration, delete the compatibility aliases in `variables.css` (`--spacing-*`, `--color-primary`, etc.) to enforce the new naming scheme.
- Purge unused legacy motion tokens (`--anim-duration-*`, `--transform-lift-*`) once all utilities reference the semantic motion layer.

## 6. Regression validation
- Re-run `npm run lint` and `npm run check` to confirm no Svelte or CSS diagnostics remain.
- Capture visual regression screenshots for key templates (home, publications listing, article detail) to confirm typography, spacing, and glass effects render consistently in both themes.
- Share the migration summary with the team to document the updated token contracts and usage guidelines.
