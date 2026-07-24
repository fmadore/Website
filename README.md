# Dr. Frédérick Madore - Academic Website

Personal academic website for Dr. Frédérick Madore, a historian and digital humanist specializing in Islam in West Africa, religious activism, and digital approaches to African studies.

**Live Site:** [https://www.frederickmadore.com/](https://www.frederickmadore.com/)

## About

This website showcases my academic work including:

- **Research Projects**: Focus on Islam in West Africa, religious activism on university campuses in Togo and Benin, and digital humanities approaches to African studies
- **Publications**: Books, journal articles, chapters, and other scholarly works
- **Digital Humanities**: Projects like the Islam West Africa Collection (IWAC)
- **Teaching**: Course materials and teaching philosophy
- **Activities**: Conferences, workshops, and academic events

## Research Focus Areas

- Islam in West Africa (Burkina Faso, Côte d'Ivoire, Benin, Togo)
- Religious activism on university campuses
- Digital humanities applications in African studies
- Muslim minorities in urban contexts

## Major Projects

- **Digital Humanities and AI in African Studies**: Exploring how DH and AI can transform knowledge production in African studies through ethical, sustainable, and Africa-centred digital infrastructures
- **Religious Activism on Campuses in Togo and Benin**: Research on Christian and Muslim student organizations
- **Muslim Minorities in Southern Cities of Benin and Togo**
- **Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso**

## Technical Implementation

This site is built with:

- [SvelteKit 2](https://kit.svelte.dev/) with [Svelte 5 runes](https://svelte.dev/docs/svelte/what-are-runes) - Frontend framework, fully prerendered to static HTML
- [TypeScript](https://www.typescriptlang.org/) (strict, `noUncheckedIndexedAccess`) - Language
- Custom token-driven CSS system — the **Ink + Signal** design language (see `src/styles/CSS-README.md`)
- Content as typed TypeScript data files in `src/lib/data/` (17 categories), auto-discovered via `import.meta.glob`
- Deployed to [GitHub Pages](https://pages.github.com/) via GitHub Actions

## Development

### Running Locally

1. Clone this repository
   ```bash
   git clone https://github.com/fmadore/Website.git
   cd Website
   ```
2. Install dependencies (Node ≥ 24)
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Quality Gates

| Command                 | What it does                                                             |
| ----------------------- | ------------------------------------------------------------------------ |
| `npm run check`         | Type-checks all Svelte components and TS modules (`svelte-check`)        |
| `npm run lint`          | Prettier + ESLint (all rules at `error`)                                 |
| `npm run test`          | Vitest unit tests — pure utils, data-integrity validation of all content |
| `npm run test:coverage` | Unit tests with V8 coverage report                                       |
| `npm run test:e2e`      | Playwright smoke tests against the production build                      |
| `npm run test:all`      | Everything above in sequence                                             |

CI runs the full gate (lint, type-check, unit tests, dependency audit, reference-index freshness, build, E2E) on every pull request, and again on the deploy path before publishing. CodeQL scans weekly and on every change.

## License

This project is licensed under the MIT License.
