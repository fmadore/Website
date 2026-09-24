/**
 * Build-time generator for the record summaries: for each dataset, the
 * projection every page but the record's own renders.
 *
 * Why: a list page, a CV section or a facet needs a record's title, dates,
 * venue and tags, and never its heaviest fields — the abstract, the citing
 * works, the HTML body. Importing a whole dataset to print those rows put
 * every heavy field into every list page's bundle: publications' `citedBy` and
 * `abstract` were 63% of that dataset's bytes, talks' `abstract` 46%,
 * activities' `content` 60%, digital-humanities `description` 72%. Each
 * summary keeps every field except the dataset's HEAVY_*_FIELDS (its
 * summaryConfig.ts, shared with the site) and adds what the rows derive from
 * them:
 *   - `abstractExcerpt`, where a record has an abstract: its first
 *     ABSTRACT_EXCERPT_LENGTH + 1 characters, one more than the longest
 *     truncation a row applies (see scripts/lib/summary-projection.mjs);
 *   - for publications, `citedByCount`, `tocAuthors` (the table of contents'
 *     contributors, which the authors facet counts) and `sourceDirType`.
 * The record pages keep reading the full records, through their server loads.
 *
 * A dataset can also declare *views*: a narrower cut of the same summaries for
 * one page that prints fewer fields still. /cv prints a talk as a dated line
 * and a publication as its bibliographic apparatus — a quarter and a half of
 * a summary's bytes — so it reads `cv.generated.ts` rather than the summaries
 * the index pages need. A view keeps the summary's order and key order and
 * picks only its CV_*_FIELDS (the types in $lib/types hold the two in step).
 *
 * Ordering: records are emitted in the order the full index is built from —
 * source-path order, which is the order Vite's `import.meta.glob` hands it —
 * because `sortByDate` is stable and two records sharing a date must keep the
 * same relative order in both. Publications are the exception, emitted by id:
 * their index sorts before anything reads it. Each dataset's summaries.test.ts
 * proves the projection faithful, order included.
 *
 * How: records load straight from TypeScript through scripts/lib/
 * data-records.mjs. Runs via the npm `prebuild` hook, or `npm run
 * gen:summaries`. Output is deterministic.
 *
 * Modes:
 *   node scripts/generate-summaries.mjs          # (re)write every projection
 *   node scripts/generate-summaries.mjs --check  # CI freshness check: exit 1
 *       if any committed projection is stale.
 */
import { relative } from 'node:path';
import { collectRecords } from './lib/data-records.mjs';
import { CHECK_MODE, emitGenerated } from './lib/generated-file.mjs';
import { inGlobOrder, projectSummary } from './lib/summary-projection.mjs';
import {
	CV_PUBLICATION_FIELDS,
	HEAVY_PUBLICATION_FIELDS
} from '../src/lib/data/publications/summaryConfig.ts';
import {
	CV_COMMUNICATION_FIELDS,
	HEAVY_COMMUNICATION_FIELDS
} from '../src/lib/data/communications/summaryConfig.ts';
import { HEAVY_ACTIVITY_FIELDS } from '../src/lib/data/activities/summaryConfig.ts';
import { HEAVY_DH_FIELDS } from '../src/lib/data/digital-humanities/summaryConfig.ts';
import { PUBLICATION_DIRECTORY_TYPES as DIR_TYPES } from '../src/lib/dataMetadata.ts';

/** Unique contributor names from a table of contents, in order of appearance. */
function tocAuthors(tableOfContents) {
	const names = [];
	for (const entry of tableOfContents ?? []) {
		if (typeof entry === 'string') continue;
		for (const name of entry.authors ?? []) if (!names.includes(name)) names.push(name);
	}
	return names;
}

const DATASETS = [
	{
		dir: 'src/lib/data/publications',
		glob: '**/*.ts',
		heavy: HEAVY_PUBLICATION_FIELDS,
		type: ['PublicationSummary', '$lib/types/publication'],
		exportName: 'publicationSummaries',
		views: [
			{
				file: 'cv.generated.ts',
				exportName: 'cvPublications',
				type: ['CvPublication', '$lib/types/publication'],
				fields: CV_PUBLICATION_FIELDS
			}
		],
		order: (entries) => [...entries].sort((a, b) => a.record.id.localeCompare(b.record.id)),
		extend(summary, record, file, dir) {
			summary.citedByCount = Array.isArray(record.citedBy) ? record.citedBy.length : 0;
			summary.tocAuthors = tocAuthors(record.tableOfContents);
			summary.sourceDirType = DIR_TYPES[relative(dir, file).split(/[\\/]/)[0]] ?? 'unknown';
		}
	},
	{
		dir: 'src/lib/data/communications',
		glob: '**/*.ts',
		heavy: HEAVY_COMMUNICATION_FIELDS,
		type: ['CommunicationSummary', '$lib/types/communication'],
		exportName: 'communicationSummaries',
		views: [
			{
				file: 'cv.generated.ts',
				exportName: 'cvCommunications',
				type: ['CvCommunication', '$lib/types/communication'],
				fields: CV_COMMUNICATION_FIELDS
			}
		]
	},
	{
		dir: 'src/lib/data/activities',
		glob: '*.ts',
		heavy: HEAVY_ACTIVITY_FIELDS,
		type: ['ActivitySummary', '$lib/types/activity'],
		exportName: 'activitySummaries'
	},
	{
		dir: 'src/lib/data/digital-humanities',
		glob: '*.ts',
		heavy: HEAVY_DH_FIELDS,
		type: ['DigitalHumanitiesSummary', '$lib/types/digitalHumanities'],
		exportName: 'dhProjectSummaries'
	}
];

const outputs = [];
const counts = [];
for (const dataset of DATASETS) {
	const { dir, glob, heavy, type, exportName, extend } = dataset;
	const entries = await collectRecords(`${dir}/${glob}`, `gen:summaries:${dir}`);
	const ordered = dataset.order ? dataset.order(entries) : inGlobOrder(entries, dir);
	const summaries = ordered.map(({ file, record }) => {
		const summary = projectSummary(record, heavy);
		extend?.(summary, record, file, dir);
		return summary;
	});
	const module = ([typeName, typeSource], exportName, items) =>
		`// AUTO-GENERATED by scripts/generate-summaries.mjs — DO NOT EDIT.
// Regenerate with \`npm run gen:summaries\` (runs automatically via the prebuild hook).
/* eslint-disable */
import type { ${typeName} } from '${typeSource}';
export const ${exportName}: ${typeName}[] = ` +
		JSON.stringify(items, null, '\t') +
		';\n';
	outputs.push([`${dir}/summaries.generated.ts`, module(type, exportName, summaries)]);
	for (const view of dataset.views ?? []) {
		const keep = new Set(view.fields);
		const items = summaries.map((summary) =>
			Object.fromEntries(Object.entries(summary).filter(([key]) => keep.has(key)))
		);
		outputs.push([`${dir}/${view.file}`, module(view.type, view.exportName, items)]);
	}
	counts.push(`${summaries.length} ${relative('src/lib/data', dir)}`);
}

if (!emitGenerated(outputs, { tag: 'gen:summaries', command: 'npm run gen:summaries' }))
	process.exit(1);
console.log(
	`[gen:summaries] ${CHECK_MODE ? '--check OK: up to date' : 'Wrote'}: ${counts.join(', ')}.`
);
