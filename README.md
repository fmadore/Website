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
- Content as typed TypeScript data files in `src/lib/data/` (18 categories), auto-discovered via `import.meta.glob`
- Deployed to [GitHub Pages](https://pages.github.com/) via GitHub Actions

### Machine-Readable Data

The same `src/lib/data/` records that render the site are also published as static JSON, prerendered with everything else, so external tools never have to scrape HTML. Start at the discovery manifest, which lists each dataset with its size and URL:

| Endpoint                       | Contents                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------- |
| `/api/index.json`              | Discovery manifest — datasets, counts, year ranges, and related feeds                   |
| `/api/research.json`           | Research projects, cross-referencing their publications, talks, grants, and fieldwork   |
| `/api/publications.json`       | Publications with identifiers, abstracts, tables of contents, citing works, and reviews |
| `/api/communications.json`     | Talks and events with venue, coordinates, and panel programmes                          |
| `/api/activities.json`         | Activity entries, including the full body of each                                       |
| `/api/digital-humanities.json` | DH projects with skills, awards, and reviews                                            |
| `/api/cv.json`                 | Career record keyed by section (appointments, grants, teaching, service, fieldwork, …)  |

Every dataset document carries `{ version, dataset, url, count, items }` (`/api/cv.json` carries `{ …, person, sections }` instead). Keys with no value are omitted rather than serialised as `null`; each item's `url` is its canonical page on this site, with external addresses collected in `links`. Serialisation lives in `src/lib/utils/apiPayload.ts` and the endpoints in `src/routes/api/`.

`/api/research.json` is the one to start a traversal from: research projects are the spine the rest of the corpus hangs off, and it resolves the free-text `project` label into arrays of publication, communication, grant, and fieldwork ids.

Being static, these are read-only and offer no query interface — fetch a dataset and filter locally. Together the six payloads are ~165 KB gzipped, small enough to load whole. `/llms.txt` and `/robots.txt` both advertise the manifest.

### MCP Server

`mcp/` is an [MCP](https://modelcontextprotocol.io/) server over those documents: eleven tools for searching publications, talks, activities, research and DH projects, reading the CV, and generating citations. It runs locally over stdio and reads the published JSON at startup, so it has no data of its own to fall out of date.

It ships two ways. `npm run mcp:pack` produces `frederickmadore-website.mcpb` — an [MCP Bundle](https://github.com/anthropics/mcpb) that Claude Desktop installs on a double-click, with no config file to edit and no Node install required; CI attaches it to every run as the `mcpb` artifact. Other stdio clients point at the developer build in `mcp/dist/index.js`. See [`mcp/README.md`](mcp/README.md).

Citation output is not reimplemented there — the build aliases `$lib` and bundles the site's own `bibtexGenerator`, so what the server returns is byte-identical to the site's download button.

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
