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
- **Rendering idiom**: sections use `CVSection` (year-grouped, keyed) with a
  `CVEntry` snippet where possible. A few sections keep hand-rolled markup
  deliberately because `pdfCvGenerator.ts` mirrors their structure — check
  the component's comments before converting one.
- **Print/PDF**: print styles are centralized in `+page.svelte` via
  `:global()`; the downloadable PDF is generated separately by
  `pdfCvGenerator.ts` (not a print of the page).
