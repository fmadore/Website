/**
 * Markdown twins of the publications: `/publications.md`, the complete list
 * the HTML index pages through, and `/publications/<id>.md`, one record with
 * its reference, abstract, apparatus and BibTeX.
 *
 * The reference is `formatReferenceText` and the BibTeX `generateBibtex` —
 * the same two products the record page's "Copy reference" and "BibTeX"
 * controls hand out, so a twin can never cite a work differently.
 */
import type { Publication, TableOfContentsEntry } from '$lib/types/publication';
import { researchProjectPath } from '$lib/data/research';
import { author } from '$lib/data/siteConfig';
import { generateBibtex } from '$lib/utils/bibtexGenerator';
import { formatReferenceText } from '$lib/utils/citationFormatter';
import { getContributorNames } from '$lib/utils/contributor';
import { joinNames } from '$lib/utils/nameUtils';
import { PUBLICATION_TYPE_SEO_LABELS } from '$lib/utils/publicationTypeLabels';
import { paragraphsToMarkdown } from './htmlToMarkdown';
import {
	bullets,
	codeBlock,
	document,
	entries,
	fields,
	groupByYear,
	inline,
	link,
	section
} from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

/** "Journal article", "Book chapter" — the sentence-case label the record's description uses. */
export const publicationTypeLabel = (type: string): string =>
	PUBLICATION_TYPE_SEO_LABELS[type] ?? type;

/** A project named on a record, linked to its research page when it has one. */
export function projectField(project: string | undefined): string | undefined {
	if (!project) return undefined;
	const path = researchProjectPath(project);
	return path ? link(project, markdownUrl(path)) : inline(project);
}

const JOURNAL_TYPES = new Set(['article', 'special-issue', 'bulletin-article', 'working-paper']);
const THESIS_TYPES = new Set(['masters-thesis', 'phd-dissertation']);

/** The record ledger, in the order and under the keys the record rail prints. */
function recordFields(pub: Publication): string {
	const isWorkingPaper = pub.type === 'working-paper';
	const isChapter = pub.type === 'chapter';
	const isJournal = JOURNAL_TYPES.has(pub.type);
	const isThesis = THESIS_TYPES.has(pub.type);
	const text = (value: string | number | undefined | null) =>
		value === undefined || value === null || value === '' ? undefined : inline(value);

	return fields([
		['Type', text(publicationTypeLabel(pub.type))],
		[pub.isEditedWork ? 'Editors' : 'Authors', text(joinNames(getContributorNames(pub.authors)))],
		['Series', isWorkingPaper ? text(pub.series) : undefined],
		['Journal', isJournal ? text(pub.journal) : undefined],
		['Volume', isJournal ? text(pub.volume) : undefined],
		['Issue', isJournal ? text(pub.issue) : undefined],
		['In', isChapter ? text(pub.book) : undefined],
		['Editors', isChapter ? text(pub.editors) : undefined],
		['Encyclopedia', pub.type === 'encyclopedia' ? text(pub.encyclopediaTitle) : undefined],
		['Proceedings', text(pub.proceedingsTitle)],
		['Conference', text([pub.conferenceName, pub.conferenceLocation].filter(Boolean).join(', '))],
		['Publisher', text(pub.publisher)],
		['Place', text(pub.placeOfPublication)],
		['Series', isWorkingPaper ? undefined : text(pub.series)],
		['University', isThesis ? text(pub.university) : undefined],
		['Department', isThesis ? text(pub.department) : undefined],
		['Advisors', isThesis ? text((pub.advisors ?? []).join(', ')) : undefined],
		['Institution', text(pub.institution)],
		['Report number', text(pub.reportNumber)],
		['Date', text(pub.date)],
		['Pages', text(pub.pages || pub.pageCount)],
		['Language', text(pub.language)],
		['ISBN', text(pub.isbn)],
		['ISSN', text(pub.issn)],
		['DOI', pub.doi ? link(pub.doi, `https://doi.org/${pub.doi}`) : undefined],
		['Open access', pub.openAccess ? 'Yes' : undefined],
		['Countries', text((pub.country ?? []).join(', '))],
		['Project', projectField(pub.project)],
		['Tags', text((pub.tags ?? []).join(', '))],
		['Web page', pageUrl(`/publications/${pub.id}`)]
	]);
}

function tocEntry(entry: string | TableOfContentsEntry): string {
	if (typeof entry === 'string') return inline(entry);
	const authors = entry.authors?.length ? `, by ${inline(joinNames(entry.authors))}` : '';
	return `${inline(entry.title)}${authors}`;
}

function reviews(pub: Publication): string {
	return bullets(
		[...(pub.reviewedBy ?? [])]
			.sort((a, b) => b.year - a.year)
			.map((review) => {
				const volume = [review.volume, review.issue && `(${review.issue})`]
					.filter(Boolean)
					.join(' ');
				const venue = [`*${inline(review.journal)}*`, volume, review.pages && `pp. ${review.pages}`]
					.filter(Boolean)
					.join(', ');
				const address = review.doi ? `https://doi.org/${review.doi}` : review.url;
				const title = address ? link(review.title, address) : inline(review.title);
				const excerpt = review.excerpt ? `\n\n> ${inline(review.excerpt)}` : '';
				return `${inline(review.author)} (${review.year}). ${title}. ${venue}.${excerpt}`;
			})
	);
}

function citedBy(pub: Publication): string {
	return bullets(
		[...(pub.citedBy ?? [])]
			.sort((a, b) => b.year - a.year)
			.map((work) => {
				const title = work.url ? link(work.title, resolveLink(work.url)) : inline(work.title);
				const source = work.source ? ` *${inline(work.source)}*.` : '';
				return `${inline(work.authors.join(', '))} (${work.year}). ${title}.${source}`;
			})
	);
}

function accessLinks(pub: Publication): string {
	const seen = new Set<string>();
	return bullets(
		[
			{ label: 'Source', url: pub.url },
			{ label: 'PDF', url: pub.pdfUrl },
			{ label: 'DOI', url: pub.doi ? `https://doi.org/${pub.doi}` : undefined },
			...(pub.additionalUrls ?? [])
		].map(({ label, url }) => {
			if (!url) return undefined;
			const address = resolveLink(url);
			if (seen.has(address)) return undefined;
			seen.add(address);
			return link(label, address);
		})
	);
}

/** `/publications/<id>.md` */
export function publicationMarkdown(pub: Publication): string {
	return document(
		`# ${inline(pub.title)}`,
		recordFields(pub),
		section('Reference', inline(formatReferenceText(pub, { doi: true }))),
		section(
			'Abstract',
			pub.abstract && paragraphsToMarkdown(pub.abstract, { resolveHref: resolveLink })
		),
		section(
			'Contents',
			(pub.tableOfContents ?? [])
				.map((entry, index) => `${index + 1}. ${tocEntry(entry)}`)
				.join('\n')
		),
		section('Reviews', reviews(pub)),
		section('Cited by', citedBy(pub)),
		section('Links', accessLinks(pub)),
		section('BibTeX', codeBlock(generateBibtex(pub), 'bibtex'))
	);
}

/** One list row: the title, linked to its twin, then the full reference. */
function listRow(pub: Pick<Publication, 'id' | 'type' | 'title'>, reference: string): string {
	const title = link(pub.title, markdownUrl(`/publications/${pub.id}`));
	return `${title} · ${inline(publicationTypeLabel(pub.type))}\n${inline(reference)}`;
}

/** `/publications.md`: every publication, newest first, grouped by year. */
export function publicationsIndexMarkdown(publications: readonly Publication[]): string {
	const counts = new Map<string, number>();
	for (const pub of publications) {
		const label = publicationTypeLabel(pub.type);
		counts.set(label, (counts.get(label) ?? 0) + 1);
	}
	const breakdown = [...counts]
		.sort((a, b) => b[1] - a[1])
		.map(([label, count]) => `${label} (${count})`)
		.join(', ');

	return document(
		'# Publications',
		`Publications by ${author.name}, newest first: ${entries(publications.length)}. By type: ${inline(breakdown)}. This is the complete list; the [web page](${pageUrl('/publications')}) shows it a page at a time, with filters. Each title links to the publication's Markdown record, with its abstract, identifiers and BibTeX. The same records are available as JSON at ${SITE}/api/publications.json.`,
		...groupByYear(publications).map(([year, items]) =>
			section(
				year,
				bullets(items.map((pub) => listRow(pub, formatReferenceText(pub, { doi: true }))))
			)
		)
	);
}
