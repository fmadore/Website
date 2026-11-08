/**
 * Markdown twin of `/publications/citations`: every citing work the pilot has
 * read, the passages in which it cites the site's publications, and how far
 * the works citing each publication have been read.
 *
 * Built from the same joined rows the page's server load hands it
 * (`buildCitationContextSections`, `buildCitingWorkRows`), so the twin quotes
 * exactly what the page quotes, and is complete where the page is filtered and
 * paged.
 */
import type { CitationPassage } from '#lib/types/citationContext.ts';
import { author } from '#lib/data/siteConfig.ts';
import {
	CITING_WORK_KIND_LABELS,
	type CitationContextSection,
	type CitingWorkRow
} from '#lib/utils/citationContexts.ts';
import { blocks, bullets, document, entries, groupByYear, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

/** Where a passage sits, as the page's apparatus line prints it. */
function apparatus(passage: CitationPassage): string {
	return [
		passage.page ? `p. ${passage.page}` : '',
		passage.citedAs ?? '',
		passage.inNote ? 'in a note' : '',
		passage.checkedBy === 'reader' ? 'read from print' : ''
	]
		.filter(Boolean)
		.join(' · ');
}

/** One quotation, with its apparatus under it. */
function quotation(passage: CitationPassage): string {
	const where = apparatus(passage);
	return `> ${inline(passage.text)}${where ? `\n>\n> — ${inline(where)}` : ''}`;
}

/** One citing work: its byline and source, then each publication it cites and the passages. */
function citingWork(work: CitingWorkRow): string {
	const title = work.url ? link(work.title, resolveLink(work.url)) : `*${inline(work.title)}*`;
	const byline = `**${inline(work.authors.join(', '))} (${work.year}).** ${title}.${
		work.source ? ` ${inline(work.source)}.` : ''
	}`;
	const meta = `${CITING_WORK_KIND_LABELS[work.kind]} · ${work.language}`;
	return blocks(
		`${byline}\n${inline(meta)}`,
		...work.groups.map((group) =>
			blocks(
				`Cites ${link(group.publicationTitle, markdownUrl(`/publications/${group.publicationId}`))}:`,
				...group.passages.map(quotation)
			)
		)
	);
}

const names = (list: { authors: string[]; year: number }[]) =>
	list.map((work) => `${work.authors.join(', ')} (${work.year})`).join('; ');

/** One publication's row of the coverage table. */
function coverageRow(pub: CitationContextSection): string {
	const figures = [
		`${pub.quoted.length} quoted`,
		pub.bibliographyOnly.length > 0 && `${pub.bibliographyOnly.length} bibliography only`,
		pub.unread.length > 0 && `${pub.unread.length} no full text`,
		pub.pending.length > 0 && `${pub.pending.length} to read`
	]
		.filter(Boolean)
		.join(', ');
	const head = `${link(pub.title, markdownUrl(`/publications/${pub.id}`))} (${pub.year}): ${figures}.`;
	const notes = [
		pub.bibliographyOnly.length > 0 && `Bibliography only: ${inline(names(pub.bibliographyOnly))}.`,
		pub.unread.length > 0 && `No full text: ${inline(names(pub.unread))}.`
	].filter(Boolean);
	return [head, ...notes].join('\n');
}

/** `/publications/citations.md` */
export function citationsMarkdown(
	sections: readonly CitationContextSection[],
	works: readonly CitingWorkRow[]
): string {
	const passages = works.reduce((sum, work) => sum + work.passageCount, 0);
	const models = [...new Set(sections.map((section) => section.model))].join(', ');
	const fromPrint = works
		.flatMap((work) => work.groups.flatMap((group) => group.passages))
		.filter((passage) => passage.checkedBy === 'reader').length;
	const pilot = sections.find((section) => section.id === 'salafism-cote-divoire-2016');

	return document(
		'# Citations in context',
		`Experimental. How other scholars use ${author.name}'s work, in their own words: the sentences in which citing works cite his publications, with the page they appear on. ${entries(works.length)}, ${passages} ${passages === 1 ? 'passage' : 'passages'}. This is the complete list; the [web page](${pageUrl('/publications/citations')}) shows it a page at a time, with filters. Each publication's JSON record carries the same passages on its \`citedBy\` entries, at ${SITE}/api/publications.json.`,
		section(
			'About this experiment',
			`This is an experiment, and a work in progress. It tests whether a language model can recover, from the full texts of the works that cite ${author.name}'s, the sentences in which they do so.${
				pilot
					? ` The pilot read every work that cites one article, ${link(pilot.title, markdownUrl(`/publications/${pilot.id}`))} (${pilot.year}), and recorded each of his publications those works cite.`
					: ''
			} Works citing only his other publications are still to be read; the coverage list below says how far each publication has got.`,
			`${models ? `${inline(models)}, a language model made by Anthropic, located each passage in the full text of the citing work, and a script then checked it word for word against that text. ` : ''}${
				fromPrint > 0
					? `${fromPrint === 1 ? 'One passage was' : `${fromPrint} passages were`} read from a printed copy instead, and ${fromPrint === 1 ? 'is' : 'are'} marked as such. `
					: ''
			}The check confirms that each quotation is exact, not that it is attached to the right publication, so errors remain possible. Note numbers are removed. The quotations remain the work of their authors, and each entry links to its source.`
		),
		...groupByYear(works).map(([year, items]) => section(year, ...items.map(citingWork))),
		section(
			'Coverage',
			'How far the works citing each publication have been read. A work is quoted when it cites the publication in its text; some list it in their bibliography only, and some could not be read because no full text was available.',
			bullets(sections.map(coverageRow))
		)
	);
}
