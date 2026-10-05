# Collaborator affiliations

The collaborator view on the publication and conference visualisation pages uses
the shared `LocationMap`. It loads the people and institution registries only when
selected. The country map keeps its shading preference and its existing lazy
loading gate; selecting collaborators does not create a second WebGL map.

## Evidence and dates

Each file in `src/lib/data/people/` contains a credited person, aliases and dated
affiliation observations. Every observation includes its sources, an evidence
quote where available, and `verified` or `uncertain` confidence. `years` records
the publication/event years supported by the source. It is **not an employment
interval**. Explicit `startYear`/`endYear` are reserved for sources that establish
an appointment's duration. Unknown historical years remain unmapped even if a
later affiliation is verified.

The initial research used parallel reviews of publication authors, panel
contributors and other event participants. DOI and publisher responses were
fetched on 1 October 2026; sources include publisher author biographies and
Crossref author affiliations. When a publisher blocked access or supplied no
affiliation, inspected primary event programmes, contemporaneous posters and
the published position paper's explicit link to participant biographies supplied
additional evidence. Existing website records alone remain uncertain. A successful
HTTP response containing a bot challenge was not treated as evidence.

## What readers see, and what only curators see

Each observation carries two kinds of text. `note` is shown to readers beside
the affiliation (in the popup and the table), so it is reserved for a short
caveat they need: chiefly a conflict between sources. `reviewNote` is the
research trail (which report, which request failed, why a candidate stayed
uncertain) and is never rendered. People follow the same split: a person's
`note` is appended when no affiliation applies ("Listed as an unaffiliated
scholar…"); their `reviewNote` records unresolved identities. An institution's
`coordinateNote` is shown as a location note, so it is kept for a point a
reader should not take at face value; how a point was found lives in its
source and the structured `coordinateQueriedOn`, `coordinateSourceKind` and
`osmFeature` fields. `registry.test.ts` holds reader notes to 160 characters.

The registry is downloaded by the visualisation pages, so a quote keeps the
affiliation line and the one sentence that names the post, never a full
biography. GitHub sources link to a fixed revision (a commit, not `main` or
`master`), so a line anchor keeps pointing at the quoted record after the file
changes; the registry test rejects a moving-branch link.

The registry preserves conflicts. For example, the 2021 event report associates
Adéjoké Rafiat Adétòrò with Ibadan/ZMO, while the previous website record says
Université Laval. The latter stays uncertain. LAM in Élodie Apard's record is
Les Afriques dans le monde; it is not expanded to a different laboratory.

## Locations and visible uncertainty

`src/lib/data/institutions.ts` normalises institutional names and contains only
institutions with a sourced campus or office point. Each location carries its
source; a reader-facing `coordinateNote` qualifies the few that need one. Coordinates represent an institution, never a
person's home or present location. City/country centroids, distributed project
locations and ambiguous campuses are not silently substituted. Affiliations
without an established institutional point retain their name and evidence but
omit `institutionId`; the UI lists them as unresolved locations.

Uncertain affiliations are excluded initially. Readers can explicitly include
them; their markers are dashed and popups/tables label them **Uncertain
affiliation**. Coordinate qualifications remain visible independently of
affiliation confidence. Marker size counts distinct people per institution;
repeated credits in one event and repeated works do not multiply people.

## Updating the registry

1. Preserve the credited spelling in the publication/event. Add `personId` to
   link it to a person; plain strings remain supported. Corporate credits use
   `kind: 'organisation'` and remain in citations, outside human networks.
2. Record the inspected source and the years it actually supports. An observation
   of a later job does not verify earlier collaborations. Keep unsupported
   candidates uncertain and retain conflicting source notes in `reviewNote`;
   add a reader `note` only for a caveat a reader needs. One person, one record:
   a shorter or longer credited name is an alias, and the registry test fails when
   every word of one person's name appears in another's.
3. Reuse a canonical institution when its campus is established. Otherwise leave
   the affiliation unpinned until its location is verified.
4. Regenerate the reference and summary projections after changing source records,
   then run the registry, aggregation and existing citation/network tests.

Research does not require a runtime API key or geocoding request. All evidence and
coordinates ship as static, reviewable data. Individual contributor profile pages
are outside this change.
