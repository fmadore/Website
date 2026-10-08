import { error } from '@sveltejs/kit';
import { allPublications } from '$lib/data/publications/index';
import { generateBibtex } from '$lib/utils/bibtexGenerator';
import type { EntryGenerator, RequestHandler } from './$types';

/**
 * A publication's BibTeX record, shipped beside its page as
 * `/publications/<id>.bib`: the metadata document the page names with its FAIR
 * Signposting `describedby` link (`$lib/utils/signposting.ts`). The rail's
 * "Download BibTeX" and the MCP server's citations come from the same
 * generator, so all three agree.
 *
 * The Content-Type below holds in dev and preview only. GitHub Pages serves
 * the prerendered file with whatever type it maps `.bib` to; the `type`
 * attribute on the page's link is what declares it to a harvester.
 */
export const prerender = true;

/** Every record gets one, as every record gets a page: see publications/[id]/+page.server.ts. */
export const entries: EntryGenerator = () => allPublications.map(({ id }) => ({ id }));

export const GET: RequestHandler = ({ params }) => {
	const publication = allPublications.find((item) => item.id === params.id);
	if (!publication) error(404, 'Publication not found');
	return new Response(`${generateBibtex(publication)}\n`, {
		headers: { 'Content-Type': 'application/x-bibtex; charset=utf-8' }
	});
};
