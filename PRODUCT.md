# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: academic peers** — researchers in Islamic studies, African studies, and digital humanities. They arrive desk-based, on larger screens, in short sessions between other work, and they scan far more than they read. They trust rigour over flash; a templated aesthetic actively costs credibility with this audience.

Their job-to-be-done: _find and cite Madore's work, or check what he is currently working on, quickly and without friction — and have the site corroborate that he is a serious person._

Secondary audiences (press, funders, students, adjacent disciplines) are real but do not drive design decisions. When their needs conflict with the peer's, the peer wins.

## Product Purpose

The academic site of Dr. Frédérick Madore, historian of Islam in francophone West Africa and Data Curator at the Cluster of Excellence "Africa Multiple", University of Bayreuth.

It exists to be the complete, current, and precise record of his scholarly output — publications, communications, activities, teaching, and digital-humanities projects — and the place where peers verify a citation or catch up on current work.

**Success:** a peer finds and cites the right work in under a minute, and leaves corroborated that this is a serious scholar. Both halves matter; speed without credibility, or credibility without speed, is failure.

## Positioning

**The authoritative record — kept authoritative by machine, not by diligence alone.** The site is more complete, more current, and more precise than any aggregator profile of the same person (Google Scholar, ORCID, ResearchGate), because it is maintained directly rather than inferred, tracks who cites what, and hands over structured citation exports.

The mechanism behind that claim is what a neighbouring academic site could not truthfully copy: the record is held as structured data rather than as pages, swept automatically for new citations and dead links, published as machine-readable metadata, and queryable by assistants through a companion MCP server. The same computational apparatus the scholar builds for his research corpora is turned on his own record. "Well maintained" is an intention anyone can claim; this is an infrastructure anyone would have to build.

This is a falsifiable claim about _record quality_: stale entries, missing works, wrong metadata, or a citation that cannot be exported all attack the position directly. Design work must never make the record harder to verify, scan, or export.

## Operating Context

- Visitors arrive from a citation, a search, a conference programme, a mailing list, or a colleague's link — often mid-task, looking for one specific thing.
- Common paths: land on a publication detail page from a search result; scan the publications index filtered by year or theme; skim the CV; check current projects; export a reference.
- Content is English-language prose about francophone West Africa: titles, names, and quotations carry French and West African diacritics throughout, in every typeface and every voice.
- The record is maintained by the scholar himself, as data files in the repository — accuracy is a continuous editorial practice, not a launch-time task.
- Automated watchers sweep for new citations and dead links on a schedule, so the record's currency is partly machine-maintained.

## Capabilities and Constraints

**Hard constraints — future design work must preserve all four:**

1. **Static, no backend.** The site is fully prerendered and deployed to GitHub Pages. There is no server, no database, and no runtime API. Every feature must work as static output; anything requiring a request at read time is off the table.
2. **Citation exports.** BibTeX generation and the PDF CV export are part of the cite-the-work path, which is the primary job-to-be-done. Breaking an export breaks the product's core use.
3. **MCP server parity.** The companion server in `mcp/` bundles the site's own citation and bibliography modules. Those modules are shared code with a second shipped product — changing them is never a site-only decision.
4. **Machine-readable metadata.** JSON-LD, RSS, and full sitemap coverage are load-bearing for the positioning above, not decoration. They are how the record stays findable and machine-consumable.

Other existing capabilities future work should expect to interoperate with:

- Data-driven content: 18 categories held as typed files (56 publications, 84 communications, 35 activities, 16 digital-humanities projects, 6 research projects, 4 teaching entries), aggregated at build time.
- Live client-side filtering and faceting on the index pages, with filter state synced to the URL so a filtered view is linkable.
- Data visualisations over the publication and communication record (charts, maps, co-authorship and keyword networks).
- Both a light and a dark theme, each treated as a first-class design pass.
- Scheduled citation and link watchers that keep the record current between edits.

## Brand Commitments

- Name and identity: Frédérick Madore; Historian, Digital Humanities & AI; Data Curator, Cluster of Excellence "Africa Multiple", University of Bayreuth. Affiliation strings, address, and author metadata are centralised in `src/lib/data/siteConfig.ts` and must never be hardcoded elsewhere.
- Voice: academic, precise, British English. No marketing register, no promotional adjectives, no growth-copy patterns. Understatement is correct; enthusiasm is not.
- The design system is named **Ink + Signal** and is binding. Its visual specification lives in `DESIGN.md` and the living reference at `/style-guide`, not here.

## Evidence on Hand

Real, verifiable material the site already holds — use this rather than inventing anything:

- The publication, communication, activity, teaching, and project records listed above, each with real metadata, dates, and identifiers (DOIs, ORCID, Wikidata Q55725595).
- Tracked citations: recorded `citedBy` entries showing who cites which work, swept from OpenAlex plus full-text discovery across Google Books, HAL, and Wikipedia.
- Two real digital collections built by the subject: the Islam West Africa Collection (IWAC) and AMIRA (Africa Multiple Interactive Research Atlas).
- Slide decks for talks, hosted at `slides.frederickmadore.com`.
- Photographs and publication covers, and archival scans from the West African press corpus.

**Absences future work must not fabricate:** there are no testimonials, endorsements, user quotes, traffic or download metrics, rankings, awards beyond those recorded in the CV data, or claims about the site's own reach. If a design needs social proof, the honest answer is the citation record, not invented praise.

## Product Principles

1. **The record's accuracy is the product.** Anything that makes an entry harder to verify, export, or trust damages the core claim. Presentation serves verification; it never obscures it.
2. **Optimise for the mid-task scanner.** The visitor usually knows what they came for. Structure, hierarchy, and filtering must get them there without reading; browsing is the secondary mode.
3. **Density is respect.** Scholars scan dense, well-set information faster than sparse pages. Do not pad with whitespace where structured information would serve the reader better.
4. **Credibility is earned by precision, not persuasion.** No marketing moves, no invented proof. The apparatus — dates, identifiers, counts, citations — is what convinces this audience.
5. **Static is a design input, not a limitation.** Every interaction must survive prerendering; design within that rather than around it.

## Accessibility & Inclusion

- Target standard: **WCAG 2.2 AA**. `@axe-core/playwright` is already in the test suite and should enforce what it mechanically can.
- French and West African diacritics must render correctly in every typeface, weight, and voice — this is a content-correctness requirement, not only a typographic one.
- Both themes are first-class: contrast, focus visibility, and legibility are verified in each, never inherited from the other.
- Content is scanned as much as read: heading structure, landmarks, and accessible names carry real navigational load for screen-reader and keyboard users.
