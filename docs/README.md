# docs/

What is here and why. The conventions themselves live in the root files
(`CLAUDE.md`, `DESIGN.md`, `PRODUCT.md`); this folder holds method and record.

- [`DESIGN-REVIEW.md`](DESIGN-REVIEW.md) — how to run a design or maintenance
  pass on this site: sources of truth, standing rules, the guard tests, the
  agent pattern that worked, and the backlog that outlived the last gate.
  **Start here.**
- [`audits/`](audits/) — the technical audits, one per pass, each scored
  against the one before it. The newest is the current state.
- [`archive/`](archive/) — closed roadmaps and reviews, kept for the reasoning
  behind decisions that are now in `DESIGN.md` and the code. Each opens with
  a banner saying when it closed and what superseded it. Nothing in there is a
  plan.

Component APIs are not documented here: each component's typed `Props`
interface is the reference, and `/style-guide` renders every idiom live.
