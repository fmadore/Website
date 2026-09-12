# CV Page Architecture

The CV route is a thin container; the section components and formatting
logic live under `$lib` so the PDF generator and the timeline can share them.

## Structure

```
src/routes/cv/
├── +page.svelte                  # Container: SEO, layout, print styles
└── timeline/+page.svelte         # /cv/timeline — CareerTimeline visualisation

src/lib/components/cv/            # Section components (one per CV section)
│   CVHeader                      # Name, position, contact links
│   CVTableOfContents             # In-page anchor nav
│   CVEducation, CVAppointments, CVResearchExperience
│   CVPublications                # Grouped by type via cvFormatters
│   CVGrants, CVAwards
│   CVConferences, CVEvents, CVInvitedTalks
│   CVTeaching, CVMedia, CVService, CVConsulting
│   CVAffiliations, CVLanguages, CVComputerSkills, CVDigitalHumanities
│   CVSection                     # Generic year-grouped section wrapper
│   CVEntry                       # Ledger-row entry (mono key left, content right)
│   PdfGenerator                  # "Download PDF" button → jsPDF (lazy-loaded)

src/lib/utils/
│   cvFormatters.ts               # formatVolumeIssueDisplay, formatAffiliationPeriod,
│                                 # groupPublicationsByType
│   pdfCvGenerator.ts             # jsPDF layout for the downloadable CV
│   publicationTypeLabels.ts      # getPublicationTypeDisplayName (section headings)
```

## Conventions

- **Data flow**: each section component imports its dataset from `$lib/data/`
  directly, filters/transforms locally, and renders independently. Shared
  formatting goes through `cvFormatters.ts` and `date-formatter.ts` — don't
  inline date or author formatting in components.
- **Rendering idiom**: every row on the sheet is a `CVEntry`, and `CVEntry` is
  the shared `.ledger-row` idiom (ink-signal.css) at its `.ledger--tight`
  density. A section either uses `CVSection` (year-grouped, keyed, with a
  `CVEntry` snippet) or hand-rolls the `<section>` + `<h3>` + ledger wrapper
  because it needs subsection `<h4>`s or a `current` key — but it still renders
  `CVEntry` rows inside `div.ledger.ledger--tight.ledger--ruled[data-cv-ledger]`.
  Do not draw a row by hand: four sections used to, each with its own padding,
  key width and hairline, which is how the CV came to hold five ledgers.
- **The DOM is the PDF's input.** `pdfCvGenerator.ts` reads the rendered page,
  so these hooks are load-bearing and must not be renamed casually:
  `#cv-content`, `section > h3`, `h4`, `div[data-cv-ledger]`, `.cv-entry`,
  `.cv-entry-year`, `.cv-entry-year--current` (prints the key in pine),
  `.cv-entry--wide` (widens the export's key gutter), `.doi-link`, and
  `data-pdf-hide` on anything the export should skip.
- **Print/PDF**: print styles are centralized in `+page.svelte` via
  `:global()`; the downloadable PDF is generated separately by
  `pdfCvGenerator.ts` (not a print of the page). Both are the same document
  and must be set in the same ink — `--color-primary` on stock, never pure
  black. `designTokenParity.test.ts` binds the PDF palette to `variables.css`
  and `pdfCvLayout.test.ts` pins which voice each exported string is cast in;
  a change to either file is expected to move a test.
