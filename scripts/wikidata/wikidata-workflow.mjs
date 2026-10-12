import { readFileSync } from 'node:fs';
import {
	hash,
	qid,
	insertQid,
	insertReviewQid,
	insertCitingQid,
	isForthcoming,
	doi
} from './wikidata.mjs';
import { reviewId, doiOf, citingWorks } from './wikidata-csl.mjs';

export function readJson(file) {
	return JSON.parse(readFileSync(file, 'utf8'));
}
export function validateReport(report, entries) {
	if (
		report.version !== 1 ||
		report.complete !== true ||
		report.errors?.length ||
		!Array.isArray(report.publications)
	)
		throw new Error('A complete version 1 audit is required');
	const age = Date.now() - Date.parse(report.generatedAt);
	if (!Number.isFinite(age) || age < -60000 || age > 7 * 86400000)
		throw new Error('Audit is stale; rerun wikidata:audit (maximum age: 7 days)');
	const rows = new Map();
	for (const row of report.publications) {
		if (rows.has(row.id)) throw new Error(`Duplicate audit ID: ${row.id}`);
		const entry = entries.find(({ record }) => record.id === row.id);
		if (entry && isForthcoming(entry.record)) continue;
		if (!entry || row.sourceHash !== hash(readFileSync(entry.file, 'utf8')))
			throw new Error(`Source changed since audit: ${row.id}; rerun audit`);
		rows.set(row.id, row);
	}
	return rows;
}
/**
 * The IDs of the reviews published records list and of the works citing
 * them, as the exporter gives them.
 */
export function reviewIds(entries) {
	const records = entries.map(({ record }) => record);
	return new Set([
		...records
			.filter((record) => !isForthcoming(record))
			.flatMap((record) => (record.reviewedBy ?? []).map((review) => reviewId(record, review))),
		...citingWorks(records).map((group) => group.id)
	]);
}
export function validateDecisions(decisions, rows, reviews = new Set()) {
	if (!decisions || Array.isArray(decisions) || typeof decisions !== 'object')
		throw new Error('Decisions must be an object keyed by publication ID');
	for (const [id, decision] of Object.entries(decisions)) {
		// A work the skill created that the site does not list (a container: an
		// edited volume, a yearbook volume) is marked as such; any other unknown ID
		// is a typo and stops the run.
		if (decision?.notOnSite === true && !rows.has(id)) continue;
		if (!rows.has(id) && !reviews.has(id))
			throw new Error(
				`Decision missing from eligible audit records (forthcoming works are excluded): ${id}`
			);
		if (!decision || typeof decision !== 'object' || Array.isArray(decision))
			throw new Error(`Invalid decision: ${id}`);
		if (decision.qid) qid(decision.qid);
		if (decision.qid && (decision.create || decision.action === 'create'))
			throw new Error(`Choose match or create: ${id}`);
	}
}
/**
 * The QIDs to write: records (by decision, or by an exact audit match with
 * --accept-exact), the reviews they list and the works citing them (by
 * decision only; a citing work's QID goes on every entry that lists it). Edits
 * to one file build on each other; each carries the file's original text and
 * its final text.
 */
export function planEdits(entries, rows, decisions, acceptExact) {
	const assigned = new Map();
	const assign = (value, owner) => {
		qid(value);
		if (assigned.has(value))
			throw new Error(`QID ${value} assigned to both ${assigned.get(value)} and ${owner}`);
		assigned.set(value, owner);
	};
	const files = new Map();
	const change = (file, edit, patch) => {
		const state = files.get(file) ?? { text: readFileSync(file, 'utf8'), edits: [] };
		state.source ??= state.text;
		const updated = patch(state.text);
		if (updated === state.text) return;
		state.text = updated;
		state.edits.push({ file, source: state.source, ...edit });
		files.set(file, state);
	};
	for (const { file, record } of entries) {
		if (isForthcoming(record)) continue;
		const row = rows.get(record.id);
		const decision = decisions[record.id];
		const selected =
			decision?.qid ??
			(!decision && acceptExact && row?.status === 'exact' ? row.suggestedQid : null);
		const value = selected ?? record.wikidataId;
		if (value) assign(value, record.id);
		if (selected)
			change(file, { id: record.id, record, qid: selected, doi: record.doi }, (text) =>
				insertQid(text, record.id, selected)
			);
		for (const review of record.reviewedBy ?? []) {
			const id = reviewId(record, review);
			const chosen = decisions[id]?.qid;
			if (chosen ?? review.wikidataId) assign(chosen ?? review.wikidataId, id);
			if (!chosen) continue;
			const reviewDoi = review.doi ?? doiOf(review.url);
			change(file, { id, record, qid: chosen, doi: reviewDoi && doi(reviewDoi) }, (text) =>
				insertReviewQid(text, review.title, chosen)
			);
		}
	}
	// A work citing several records is one item: its QID is unique among the
	// citing works, and may be a record's own (a self-citation).
	const citing = new Map();
	const fileOf = new Map(entries.map(({ file, record }) => [record, file]));
	for (const group of citingWorks(entries.map(({ record }) => record))) {
		const chosen = decisions[group.id]?.qid;
		const value = chosen ?? group.entries.map((e) => e.citing.wikidataId).find(Boolean);
		if (value) {
			qid(value);
			if (citing.has(value))
				throw new Error(`QID ${value} assigned to both ${citing.get(value)} and ${group.id}`);
			citing.set(value, group.id);
		}
		if (!chosen) continue;
		for (const { record, citing: entry } of group.entries) {
			const citingDoi = doiOf(entry.url);
			change(
				fileOf.get(record),
				{ id: group.id, record, qid: chosen, doi: citingDoi && doi(citingDoi) },
				(text) => insertCitingQid(text, entry.title, chosen)
			);
		}
	}
	return [...files.values()].flatMap(({ text, edits }) =>
		edits.map((edit) => ({ ...edit, updated: text }))
	);
}
