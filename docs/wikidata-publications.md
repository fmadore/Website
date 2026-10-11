# Reconcile publications with Wikidata

The publication-identity workflow for [issue #186](https://github.com/fmadore/Website/issues/186). The work is split in two:

- **This repository** exports the publication records, audits them against Wikidata, and writes confirmed QIDs back into the records (`wikidataId`, emitted in JSON-LD `sameAs`). Nothing here edits Wikidata, needs credentials, or runs at build time.
- **The `wikicite` Claude skill** (`~/.claude/skills/wikicite`, in the `claude-skills` repository) does everything that reaches Wikidata: resolving authors, editors, journals, containing books and publishers; enriching existing items (identifiers such as OpenAlex, Semantic Scholar, HAL, JSTOR; full-text links; `mul` labels; corrections); creating missing items; and later the `cites work` (P2860) links. It produces QuickStatements files that the author reviews and submits under his own account, by pasting them into QuickStatements or with the skill's `submit.mjs` (the QuickStatements API, with his token read from his own environment; never stored here or in CI).

**Forthcoming publications are excluded from all Wikidata work until published.** This uses the site's `date` labels (`Forthcoming`, `À paraître`, `a paraitre`, case- and whitespace-insensitive), even when an estimated year or a DOI is present. The export leaves them out and the audit lists them separately without searching. A work becomes eligible when its record carries an actual publication date; nothing becomes eligible because an estimated date has passed.

## 1. Export

```sh
npm run wikidata:export
```

Writes `reports/wikidata/works.csl.json` (Git-ignored, like everything under `reports/wikidata/`): one CSL-JSON item per published record, with the recorded `wikidataId` as `custom.wikidata`. A DOI carried by several records (an edited volume and its chapters, a bulletin issue and its articles) names their container: only the book or special issue keeps it as `DOI`, the others carry it as `custom.containerDoi`, so it never identifies a chapter or a bulletin article.

## 2. Reconcile, enrich and create (wikicite)

In a Claude Code session, ask to reconcile `reports/wikidata/works.csl.json` with Wikidata; the skill's `SKILL.md` describes the stages. Its run directory goes under `reports/wikidata/` too. Useful arguments for this corpus: the author item `Q55725595`, OpenAlex author `A5000010243`, Semantic Scholar author `104320398`, idHAL `frederick-madore`.

The decisions file the skill builds (`reports/wikidata/decisions.json`) records confirmed matches as `{"works": {"<publication-id>": {"qid": "Q…"}}}`, the form step 4 reads.

## 3. Audit

```sh
npm run wikidata:audit
```

Read `reports/wikidata/audit.md` for the overview and `audit.json` for evidence: titles, dates, DOI/ISBN, classes, author/editor QIDs, author strings and containers. Use `--id publication-id` for one record and `--out path.json` for another location.

The script queries both [Wikidata graphs](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/WDQS_graph_split), looks up DOI and book ISBN values, compares the author's existing works by title, and searches labels in English, French and German.

- `recorded`: the publication already has a QID.
- `exact`: a unique DOI match corroborated by title, with no conflicting DOI on that item.
- `review`: title candidates, ISBN/edition matches, or ambiguous identifiers. Compare the evidence before choosing.
- `unmatched`: no candidate found by these searches; not proof that no item exists.
- `unavailable`: a lookup failed; fix connectivity and rerun before making decisions.

Search returns up to ten candidates per query and language: a discovery aid, not a catalogue. A service error produces an incomplete report and a nonzero exit, never permission to apply.

### Fuzzy title discovery

Title discovery searches the full title, a punctuation/spacing/accent-normalised version, a substantial main title without its subtitle, and an eight-word prefix for long titles (at most four queries per language, ten results per query). Candidates are ranked against labels, aliases and recorded titles using normalised equality, spacing-insensitive comparison, edit similarity and token overlap; conflicting numbers or years lower scores, and short generic titles never become fuzzy matches. Scores measure title resemblance, **not identity**: fuzzy and title-only matches never qualify for automatic QID assignment.

## 4. Save matches

Preview, then write, the high-confidence DOI matches and the confirmed decisions:

```sh
npm run wikidata:apply -- --accept-exact --decisions reports/wikidata/decisions.json
npm run wikidata:apply -- --accept-exact --decisions reports/wikidata/decisions.json --write
npm run gen:summaries
```

The decisions file is either the wikicite file (decisions under `works`) or a flat object keyed by publication `id`. `{"qid": "Q…"}` selects an item; an empty `{}` suppresses automatic acceptance for that publication; a `create` decision assigns nothing. A decision for a work the site does not list (a container the skill created, such as an edited volume or a ZMO Jahrbuch volume) carries `"notOnSite": true` and is skipped; any other ID with no publication record stops the run, since it is most likely a typo.

ZMO Bulletin DOIs name a whole issue ("ZMO Bulletin No. 44"), never an article in it, so the export always passes them as `custom.containerDoi` (`ISSUE_DOI_PERIODICALS` in `scripts/wikidata/wikidata-csl.mjs`).

Apply checks that every selected item exists, is not a redirect and carries no conflicting DOI. It validates the whole plan before writing, refuses duplicate QIDs and the replacement of an existing QID, and adds only a top-level `wikidataId` to each publication's TypeScript file, preserving comments and nested citation records. It defaults to a dry run.

Audits must be complete, less than seven days old and match the current source files: after applying QIDs or editing records, rerun the audit before the next apply. Then regenerate summaries, review the diff, and run `npm run lint`, `npm run check` and `npm run check:generated`.

After the author submits a creation batch, the new QIDs go into the decisions file in place of the `create` decision; rerun the audit and apply them the same way. Direct QID verification uses the Wikibase API, so it works before the SPARQL indexes catch up.
