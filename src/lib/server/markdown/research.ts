/**
 * Markdown twins of the research section: `/research.md`, the projects in the
 * order the landing page prints them, and `/research/<id>.md`, one project
 * with its narrative (read from the route page's own markup), its grants and
 * the publications and talks that belong to it.
 */
import type { Grant, ResearchProject } from '$lib/types';
import { allGrants } from '$lib/data/grants/index';
import { publicationsByDate } from '$lib/data/publications/index';
import { communicationsByDate } from '$lib/data/communications/index';
import { formatProjectPeriod } from '$lib/utils/projectPeriod';
import { formatReferenceText } from '$lib/utils/citationFormatter';
import { formatCommunicationCitation } from '$lib/utils/citationFormatter';
import { talkTypeLabel } from './communications';
import { bullets, document, entries, fields, inline, link, section } from './markdown';
import { publicationTypeLabel } from './publications';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';
import { pageProseMarkdown } from './svelteProse';

/** "€317,690": the figure the project rail prints. */
function grantAmount(grant: Grant): string | undefined {
	if (!grant.amount) return undefined;
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: grant.currency || 'EUR',
		maximumFractionDigits: 0
	}).format(grant.amount);
}

/** A project's grants, most recently started first, as the layout derives them. */
function projectGrants(project: ResearchProject): Grant[] {
	return allGrants
		.filter((grant) => grant.project === project.projectName)
		.sort((a, b) => new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime());
}

function grantRow(grant: Grant): string {
	const amount = grantAmount(grant);
	const detail = [amount, grant.status].filter(Boolean).join(', ');
	const title = grant.url ? link(grant.title, resolveLink(grant.url)) : inline(grant.title);
	return `**${inline(grant.dateRangeString)}** ${title}, ${inline(grant.funder)}${detail ? ` (${inline(detail)})` : ''}`;
}

/** `/research/<id>.md` */
export function researchProjectMarkdown(project: ResearchProject): string {
	const grants = projectGrants(project);
	const showFunding = project.showFunding ?? true;
	const primary = grants[0];
	const directors = project.coDirectors?.length
		? project.coDirectors
		: (primary?.coApplicants ?? []);
	const publications = publicationsByDate.filter((pub) => pub.project === project.projectName);
	const talks = communicationsByDate.filter((talk) => talk.project === project.projectName);

	return document(
		`# ${inline(project.title)}`,
		project.subtitle && `*${inline(project.subtitle)}*`,
		fields([
			['Period', inline(formatProjectPeriod(project.years))],
			['Co-directors', showFunding && directors.length ? inline(directors.join(', ')) : undefined],
			['Funder', showFunding ? inline(project.funder ?? primary?.funder ?? '') : undefined],
			['Programme', project.programme && inline(project.programme)],
			['Regions', project.regions?.length ? inline(project.regions.join(', ')) : undefined],
			[
				'Source languages',
				project.sourceLanguages?.length ? inline(project.sourceLanguages.join(', ')) : undefined
			],
			['Web page', pageUrl(`/research/${project.id}`)]
		]),
		pageProseMarkdown(`/src/routes/research/${project.id}/+page.svelte`, 'ResearchProjectLayout'),
		project.audioSrc &&
			section(
				'Podcast discussion (AI-generated)',
				link('Listen to the audio overview', resolveLink(project.audioSrc))
			),
		showFunding && section('Grants', bullets(grants.map(grantRow))),
		section(
			'Publications',
			bullets(
				publications.map(
					(pub) =>
						`${link(pub.title, markdownUrl(`/publications/${pub.id}`))} · ${inline(publicationTypeLabel(pub.type))}\n${inline(formatReferenceText(pub))}`
				)
			)
		),
		section(
			'Talks',
			bullets(
				talks.map((talk) => {
					const type = talkTypeLabel(talk.type);
					return `${link(talk.title, markdownUrl(`/communications/${talk.id}`))}${type ? ` · ${inline(type)}` : ''}\n${inline(formatCommunicationCitation(talk))}`;
				})
			)
		),
		section(
			'Links',
			bullets((project.ctas ?? []).map((cta) => link(cta.label, resolveLink(cta.href))))
		)
	);
}

function projectRow(project: ResearchProject): string {
	const title = link(project.title, markdownUrl(`/research/${project.id}`));
	return `${title} · ${inline(formatProjectPeriod(project.years))}\n${inline(project.shortDescription)}`;
}

/** `/research.md`: the standfirst, then current and earlier projects. */
export function researchIndexMarkdown(projects: readonly ResearchProject[]): string {
	const current = projects.filter((project) => project.current);
	const earlier = projects.filter((project) => !project.current);
	return document(
		'# Research',
		pageProseMarkdown('/src/routes/research/+page.svelte', 'PageIntro'),
		`This list holds ${entries(projects.length)}; the [web page](${pageUrl('/research')}) prints the same projects with a timeline of their periods. Each title links to the project's Markdown record, with its full narrative, grants, publications and talks. The same records are available as JSON at ${SITE}/api/research.json.`,
		section(
			current.length === 1 ? 'Current project' : 'Current projects',
			bullets(current.map(projectRow))
		),
		section('Earlier projects', bullets(earlier.map(projectRow)))
	);
}
