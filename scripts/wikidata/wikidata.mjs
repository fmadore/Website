import { createHash } from 'node:crypto';
import ts from 'typescript';
import { cleanTitle } from '../lib/citation-text.mjs';
import { linkedData } from '../../src/lib/data/siteConfig.ts';
import { isForthcoming } from '../../src/lib/utils/date-formatter.ts';
export { isForthcoming };

export const AUTHOR_QID = linkedData.person.wikidataId;
export const ENDPOINTS = [
	'https://query.wikidata.org/sparql',
	'https://query-scholarly.wikidata.org/sparql'
];
export const API = 'https://www.wikidata.org/w/api.php';
export const hash = (source) => createHash('sha256').update(source).digest('hex');
export const doi = (value = '') =>
	value
		.trim()
		.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
		.replace(/^doi:\s*/i, '')
		.toUpperCase();
export const titleKey = (value) =>
	cleanTitle(value)
		.normalize('NFKD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim();
export function qid(value) {
	if (!/^Q[1-9]\d*$/.test(value)) throw new Error(`Invalid QID: ${value}`);
	return value;
}

/** Read-only client: serial requests, descriptive UA, bounded retries and timeout. */
export function client(
	fetcher = fetch,
	pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
) {
	return async (base, params) => {
		const url = new URL(base);
		url.search = new URLSearchParams(params).toString();
		for (let attempt = 0; attempt < 3; attempt++) {
			await pause(attempt ? 2000 * attempt : 250);
			const response = await fetcher(url, {
				headers: {
					'User-Agent': 'MadorePublicationReconciliation/1.0 (https://github.com/fmadore/Website)',
					Accept: 'application/sparql-results+json, application/json'
				},
				signal: AbortSignal.timeout(45000)
			});
			if ([429, 502, 503, 504].includes(response.status) && attempt < 2) {
				const seconds = Number(response.headers.get('retry-after'));
				if (seconds > 0) await pause(Math.min(seconds, 60) * 1000);
				continue;
			}
			if (!response.ok) throw new Error(`${url.hostname}: HTTP ${response.status}`);
			const data = await response.json();
			// MediaWiki reports overload (busy search, maxlag) inside an HTTP 200.
			if (/too-busy|maxlag|ratelimited/.test(data.error?.code ?? '') && attempt < 2) continue;
			if (data.error) throw new Error(`${url.hostname}: ${data.error.code}: ${data.error.info}`);
			return data;
		}
	};
}

/**
 * Exact indexed lookups, never a full-graph case-insensitive string scan. A DOI
 * in `containerDois` (shared by several records: an edited volume's chapters,
 * a bulletin issue's articles) identifies the container, not the record.
 */
export function lookupQuery(records, containerDois = new Set()) {
	const tuples = [];
	for (const p of records) {
		if (isForthcoming(p)) continue;
		const add = (property, value, reason) =>
			tuples.push(
				`(${JSON.stringify(p.id)} wdt:${property} ${JSON.stringify(value)} ${JSON.stringify(reason)})`
			);
		if (
			p.doi &&
			!(containerDois.has(p.doi.toLowerCase()) && !['book', 'special-issue'].includes(p.type))
		)
			for (const value of new Set([doi(p.doi), doi(p.doi).toLowerCase()]))
				add('P356', value, 'doi');
		if (p.isbn && p.type === 'book')
			for (const value of new Set([p.isbn, p.isbn.replace(/[-\s]/g, '')]))
				add(value.replace(/[-\s]/g, '').length === 13 ? 'P212' : 'P957', value, 'isbn');
	}
	if (!tuples.length) return null;
	return `PREFIX wdt: <http://www.wikidata.org/prop/direct/>
SELECT DISTINCT ?id ?item ?reason WHERE {
VALUES (?id ?property ?value ?reason) { ${tuples.join('\n')} }
?item ?property ?value . }`;
}

export async function entities(ids, request) {
	const result = new Map();
	const unique = [...new Set(ids.map(qid))];
	for (let i = 0; i < unique.length; i += 50) {
		const data = await request(API, {
			action: 'wbgetentities',
			ids: unique.slice(i, i + 50).join('|'),
			props: 'labels|aliases|descriptions|claims',
			format: 'json'
		});
		if (!data.entities) throw new Error('Missing entities in Wikidata response');
		for (const id of unique.slice(i, i + 50)) {
			const entity = data.entities[id];
			if (!entity || 'missing' in entity || entity.type !== 'item')
				throw new Error(`Missing/non-item Wikidata entity: ${id}`);
			result.set(id, entity);
		}
	}
	return result;
}

export const values = (entity, property) =>
	(entity.claims?.[property] ?? [])
		.filter((s) => s.rank !== 'deprecated')
		.map((s) => s.mainsnak?.datavalue?.value)
		.filter((v) => v !== undefined);
export function candidate(entity, reasons) {
	return {
		qid: entity.id,
		reasons: [...new Set(reasons)].sort(),
		labels: Object.fromEntries(
			Object.entries(entity.labels ?? {}).map(([lang, label]) => [lang, label.value])
		),
		titles: values(entity, 'P1476').map((v) => v.text),
		aliases: Object.values(entity.aliases ?? {})
			.flat()
			.map((alias) => alias.value),
		dois: values(entity, 'P356'),
		isbns: [...values(entity, 'P212'), ...values(entity, 'P957')],
		classes: values(entity, 'P31').map((v) => v.id),
		authors: values(entity, 'P50').map((v) => v.id),
		editors: values(entity, 'P98').map((v) => v.id),
		authorNames: values(entity, 'P2093'),
		dates: values(entity, 'P577').map((v) => v.time),
		containers: values(entity, 'P1433').map((v) => v.id)
	};
}

/** Only a unique DOI with corroborating title and no conflicting identifier is automatic. */
export function classify(p, candidates) {
	if (isForthcoming(p)) return { status: 'excluded-forthcoming', suggestedQid: null };
	if (p.wikidataId) return { status: 'recorded', suggestedQid: p.wikidataId };
	const exact = candidates.filter((c) => c.reasons.includes('doi') || c.reasons.includes('isbn'));
	if (exact.length === 1) {
		const c = exact[0];
		const sameTitle = [...Object.values(c.labels), ...c.titles].some(
			(title) => titleKey(title) === titleKey(p.title)
		);
		if (
			c.reasons.includes('doi') &&
			sameTitle &&
			c.dois.length &&
			c.dois.every((d) => doi(d) === doi(p.doi))
		)
			return { status: 'exact', suggestedQid: c.qid };
	}
	return { status: candidates.length ? 'review' : 'unmatched', suggestedQid: null };
}

/** Patch just the exported publication's top-level field, preserving all other bytes. */
export function insertQid(source, id, value) {
	qid(value);
	const ast = ts.createSourceFile('publication.ts', source, ts.ScriptTarget.Latest, true);
	const objects = [];
	function visit(node) {
		if (
			ts.isObjectLiteralExpression(node) &&
			node.properties.some(
				(p) =>
					ts.isPropertyAssignment(p) &&
					p.name.getText(ast).replace(/['"]/g, '') === 'id' &&
					ts.isStringLiteral(p.initializer) &&
					p.initializer.text === id
			)
		)
			objects.push(node);
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (objects.length !== 1) throw new Error(`Cannot locate unique publication object: ${id}`);
	const object = objects[0];
	const existing = object.properties.find(
		(p) => p.name?.getText(ast).replace(/['"]/g, '') === 'wikidataId'
	);
	if (existing) {
		if (
			!ts.isPropertyAssignment(existing) ||
			!ts.isStringLiteral(existing.initializer) ||
			existing.initializer.text !== value
		)
			throw new Error(`Refusing to replace existing QID for ${id}`);
		return source;
	}
	// Right after `id`, so every record still opens with its id.
	const idProperty = object.properties.find(
		(p) => p.name?.getText(ast).replace(/['"]/g, '') === 'id'
	);
	const comma = source.indexOf(',', idProperty.getEnd());
	let start = object.getStart(ast) + 1;
	if (comma !== -1 && !source.slice(idProperty.getEnd(), comma).trim()) {
		// After the comma and any line comment on the same line, which stays with `id`.
		const lineEnd = source.slice(comma + 1).search(/\r?\n/);
		const rest = lineEnd === -1 ? '' : source.slice(comma + 1, comma + 1 + lineEnd);
		start = lineEnd !== -1 && /^\s*(\/\/.*)?$/.test(rest) ? comma + 1 + lineEnd : comma + 1;
	}
	const newline = source.includes('\r\n') ? '\r\n' : '\n';
	return source.slice(0, start) + `${newline}\twikidataId: '${value}',` + source.slice(start);
}

/**
 * Patch one review of a record (an element of its `reviewedBy` array, found
 * by its title) with the review's own QID, as its first field.
 */
export function insertReviewQid(source, title, value) {
	qid(value);
	const ast = ts.createSourceFile('publication.ts', source, ts.ScriptTarget.Latest, true);
	const name = (p) => p.name?.getText(ast).replace(/['"]/g, '');
	const reviews = [];
	function visit(node) {
		if (
			ts.isPropertyAssignment(node) &&
			name(node) === 'reviewedBy' &&
			ts.isArrayLiteralExpression(node.initializer)
		)
			for (const element of node.initializer.elements)
				if (
					ts.isObjectLiteralExpression(element) &&
					element.properties.some(
						(p) =>
							ts.isPropertyAssignment(p) &&
							name(p) === 'title' &&
							ts.isStringLiteralLike(p.initializer) &&
							p.initializer.text === title
					)
				)
					reviews.push(element);
		ts.forEachChild(node, visit);
	}
	visit(ast);
	if (reviews.length !== 1) throw new Error(`Cannot locate unique review: ${title}`);
	const review = reviews[0];
	const existing = review.properties.find((p) => name(p) === 'wikidataId');
	if (existing) {
		if (
			!ts.isPropertyAssignment(existing) ||
			!ts.isStringLiteral(existing.initializer) ||
			existing.initializer.text !== value
		)
			throw new Error(`Refusing to replace existing QID of review ${title}`);
		return source;
	}
	const first = review.properties[0];
	const start = first.getStart(ast);
	// On its own line when the fields are one per line, else inline.
	const indent = source.slice(source.lastIndexOf('\n', start) + 1, start);
	const newline = source.includes('\r\n') ? '\r\n' : '\n';
	const separator = /^\s*$/.test(indent) ? `${newline}${indent}` : ' ';
	return source.slice(0, start) + `wikidataId: '${value}',${separator}` + source.slice(start);
}
