# docs/

What is here and why. The conventions themselves live in the root files
(`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`); this folder holds method and record.

- [`DESIGN-REVIEW.md`](DESIGN-REVIEW.md) — how to run a design or maintenance
  pass on this site: sources of truth, standing rules, the guard tests, the
  agent pattern that worked, and the backlog that outlived the last gate.
  **Start here.**
- [`digital-humanities-and-software.md`](digital-humanities-and-software.md) —
  why the applications are a section of `/digital-humanities` rather than a
  page of their own, how a record is filed as software, and when to revisit.
- [`collaborator-affiliations.md`](collaborator-affiliations.md) — how the
  collaborator view on the visualisation pages loads the people and institution
  registries, and how an affiliation is recorded.
- [`wikidata-publications.md`](wikidata-publications.md) — the workflow that
  reconciles publication records with Wikidata and writes QIDs back.
- [`audits/2026-11-audit.md`](audits/2026-11-audit.md) — the open review; its
  Status section says what has closed.
- Audits are not kept here once they close. The 2026-08 and 2026-09 technical
  audits were removed on 2026-09-25 with every finding fixed or ruled on;
  `git show c0343ec:docs/audits/2026-09-audit.md` recovers the last one. A new
  audit belongs in `audits/` while it has open findings.
- [`archive/`](archive/) — closed roadmaps and reviews, kept for the reasoning
  behind decisions that are now in `DESIGN.md` and the code. Each opens with
  a banner saying when it closed and what superseded it. Nothing in there is a
  plan.

Component APIs are not documented here: each component's typed `Props`
interface is the reference, and `/style-guide` renders every idiom live.
