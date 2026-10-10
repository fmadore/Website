/**
 * The Markdown twin of the CV: `/cv.md`, the whole curriculum vitae as one
 * document.
 *
 * Built from the same records and the same formatters as the HTML CV
 * (`src/routes/cv/+page.svelte` and the section components in
 * `$lib/components/cv/`), never by reading the rendered page: the same
 * sections in the same order, each filtering and ordering its records as its
 * component does, each entry set as the component sets it. A ledger row
 * becomes a bullet that leads with its key in bold (`**2021–25**`); the
 * quieter lines a row carries on the page (details, notes, review lists,
 * project addresses) become nested bullets under it.
 *
 * Three things are not on the page: headings are sentence case, as the copy
 * rules want outside navigation; publication, talk and project titles link to
 * their own Markdown records, so an agent can walk from the CV to any entry;
 * and the icon glyphs and "(opens in new tab)" hints, which are interface,
 * are dropped.
 *
 * Which records a section holds and in what order is decided once, in
 * `$lib/utils/cvSections.ts`, which the components read too; the consulting
 * and computer-skills entries are data (`$lib/data/consulting.ts`,
 * `$lib/data/computerSkills.ts`). Only the setting of an entry is this
 * module's own.
 */
import { affiliationsByStartDate } from '$lib/data/affiliations';
import { appointmentsByDate } from '$lib/data/appointments';
import { awardsByDate } from '$lib/data/awards';
import { cvCommunicationsByDate } from '$lib/data/communications/cv';
import { computerSkills as skillGroups } from '$lib/data/computerSkills';
import { consulting as consultingEngagements } from '$lib/data/consulting';
import { allDhProjectSummaries } from '$lib/data/digital-humanities/summaries';
import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';
import { educationByDate } from '$lib/data/education';
import { fieldworksByDate } from '$lib/data/fieldworks';
import { grantsByDate } from '$lib/data/grants';
import { languagesByProficiency } from '$lib/data/languages';
import { mediaAppearancesByDate } from '$lib/data/media-appearances';
import { peerReviewsByDate } from '$lib/data/peer-reviews';
import { cvPublicationsByDate } from '$lib/data/publications/cv';
import { researchRolesByDate } from '$lib/data/research-roles';
import { address, author, contact, socialLinks, website } from '$lib/data/siteConfig';
import teaching from '$lib/data/teaching';
import guestLectures from '$lib/data/teaching/guest-lectures';
import type { CvCommunication } from '$lib/types/communication';
import type { DigitalHumanitiesSummary } from '$lib/types/digitalHumanities';
import type { CvPublication } from '$lib/types/publication';
import { BUILT_AT } from '$lib/utils/buildDate';
import {
	formatAffiliationPeriod,
	formatBlogDate,
	formatCVAuthorList,
	formatCVYearRange,
	formatEditorList,
	formatVolumeIssueDisplay,
	getCVDisplayYear,
	groupPublicationsByType,
	terminalPeriod,
	trimTerminalPeriod
} from '$lib/utils/cvFormatters';
import {
	cvEventDate,
	formatCvEditionDate,
	groupFieldworkByPlace,
	invitedTalkVenue,
	isCvPublication,
	lectureHostAndLevel,
	organisedPanelTitle,
	realEditorialMemberships,
	realPeerReviews,
	sortCoursesByYear,
	sortDhProjectsByRecency,
	splitCvTalks,
	splitEducation,
	teachingLectures,
	teachingLevelLabel
} from '$lib/utils/cvSections';
import { formatDayMonth, getYearFromISODate } from '$lib/utils/date-formatter';
import { groupProjectLinks, projectLinkText } from '$lib/utils/projectLinks';
import { getPublicationTypeDisplayName } from '$lib/utils/publicationTypeLabels';
import { quoteTitle, typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';
import { htmlToMarkdown } from './htmlToMarkdown';
import { blocks, bullets, document, fields, inline, link, section } from './markdown';
import { markdownUrl, pageUrl, resolveLink, SITE } from './site';

type Line = string | false | null | undefined;

// ---------------------------------------------------------------------------
// Inline pieces
// ---------------------------------------------------------------------------

/** Plain text with its quotation marks typeset, as the components print it. */
const text = (value: string | undefined | null): string => inline(typesetQuotes(value));

/** Italic, for what the components set in `<em>`; nothing at all for an empty value. */
function em(value: string | undefined | null): string {
	const body = text(value);
	return body ? `*${body}*` : '';
}

/** Bold, for what the components set in `<strong>`. */
function strong(value: string | undefined | null): string {
	const body = text(value);
	return body ? `**${body}**` : '';
}

/** A link whose text is Markdown already (an italic title, a converted citation). */
function markdownLink(label: string, url: string): string {
	const address = resolveLink(url).replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
	return `[${label}](${address})`;
}

/** A link to an address written in the data, made absolute if it is the site's own. */
const outLink = (label: string, url: string): string => link(label, resolveLink(url));

/** An HTML fragment from the data or a formatter, as inline Markdown. */
const fromHtml = (html: string): string => htmlToMarkdown(html, { resolveHref: resolveLink });

/**
 * A CV byline, "A, **Frédérick Madore** and B." with its closing stop: empty
 * when the site author signs alone, as `formatCVAuthorList` decides.
 */
function byline(authors: CvPublication['authors'] | CvCommunication['authors']): string {
	const formatted = formatCVAuthorList(authors);
	return formatted ? `${fromHtml(formatted)}${terminalPeriod(formatted)}` : '';
}

/** "Guest Edited Journals" → "Guest edited journals"; a word with a capital inside (PhD) is kept. */
function sentenceCase(label: string): string {
	return label.replace(/(?<=\s)\p{Lu}(?=\p{Ll}*(?:\s|$))/gu, (capital) => capital.toLowerCase());
}

// ---------------------------------------------------------------------------
// Ledger structure
// ---------------------------------------------------------------------------

/**
 * One ledger row: the hanging key in bold, the record, and the quieter lines
 * the row carries on the page as nested bullets.
 */
function entry(key: string | number, record: string, notes: Line[] = []): string {
	const sub = bullets(notes);
	return `**${inline(key)}** ${record}${sub ? `\n${sub}` : ''}`;
}

/** A `###` subsection, or nothing when it has no content. */
function subsection(title: string, ...parts: Line[]): string {
	const body = blocks(...parts);
	return body ? `### ${title}\n\n${body}` : '';
}

/** A section's ledger, or the component's empty-state note when it has no rows. */
const ledgerOr = (rows: string[], emptyMessage: string): string =>
	rows.length > 0 ? bullets(rows) : emptyMessage;

// ---------------------------------------------------------------------------
// Header (CVHeader)
// ---------------------------------------------------------------------------

function header(): string {
	const asOf = formatCvEditionDate(BUILT_AT);
	const street = address.street
		? `${address.street}, ${address.postalCode} ${address.city}`
		: `${address.postalCode} ${address.city}`;
	const postal = [address.institution, address.department, street, address.room]
		.filter(Boolean)
		.join(', ');
	const profiles = [socialLinks.linkedIn, socialLinks.github, socialLinks.orcid]
		.map((profile) => link(profile.name, profile.url))
		.join(', ');

	return blocks(
		`**${inline(author.fullName)}**: ${inline(author.position)}`,
		fields([
			['Address', inline(postal)],
			['Email', link(contact.email, socialLinks.email.url)],
			['Website', link(website.domain, website.url)],
			['Profiles', profiles]
		]),
		`As of ${asOf}. The same record is on the [web page](${pageUrl('/cv')}), and its career sections are available as [JSON](${SITE}/api/cv.json); publications and talks have datasets of their own, [publications.json](${SITE}/api/publications.json) and [communications.json](${SITE}/api/communications.json). Publication, talk and project titles link to their Markdown records.`
	);
}

// ---------------------------------------------------------------------------
// Professional appointments (CVAppointments)
// ---------------------------------------------------------------------------

function appointments(): string {
	const rows = appointmentsByDate.map((appt) =>
		entry(
			formatCVYearRange(appt.startYear, appt.endYear),
			`${text(appt.title)}, ${text(appt.institution)}${appt.location ? `, ${text(appt.location)}` : ''}.`,
			[appt.details && text(appt.details)]
		)
	);
	return section(
		'Professional appointments',
		ledgerOr(rows, 'No professional appointments listed.')
	);
}

// ---------------------------------------------------------------------------
// Education (CVEducation)
// ---------------------------------------------------------------------------

function education(): string {
	const { degrees, trainings, certificates, other } = splitEducation(educationByDate);
	const location = (value?: string) => (value ? `, ${text(value)}` : '');
	const details = (value?: string) => (value ? `, ${text(value)}` : '');

	return section(
		'Education',
		subsection(
			'Degrees',
			bullets(
				degrees.map((edu) =>
					entry(
						edu.year,
						`${text(edu.degree)}. ${text(edu.institution)}${location(edu.location)}.`,
						[
							edu.thesisTitle && `Dissertation: ${inline(quoteTitle(edu.thesisTitle))}`,
							edu.details && text(edu.details)
						]
					)
				)
			)
		),
		subsection(
			'Digital humanities trainings',
			bullets(
				trainings.map((edu) =>
					entry(
						edu.year,
						`${inline(quoteTitle(edu.degree))}. ${text(edu.institution)}${location(edu.location)}${details(edu.details)}.`
					)
				)
			)
		),
		subsection(
			'Certificates',
			bullets(
				certificates.map((edu) =>
					entry(
						edu.year,
						`${text(edu.degree)}. ${text(edu.institution)}${location(edu.location)}${details(edu.details)}.`
					)
				)
			)
		),
		subsection(
			'Other education',
			bullets(
				other.map((edu) =>
					entry(
						edu.year,
						`${text(edu.degree)}. ${text(edu.institution)}${location(edu.location)}.`,
						[edu.details && text(edu.details)]
					)
				)
			)
		),
		educationByDate.length === 0 && 'No educational qualifications listed.'
	);
}

// ---------------------------------------------------------------------------
// Publications (CVPublications)
// ---------------------------------------------------------------------------

/** "Berlin: De Gruyter", or whichever of the two the record has. */
function placeAndPublisher(pub: CvPublication): string {
	const city = typesetQuotes(pub.placeOfPublication);
	const publisher = typesetQuotes(pub.publisher);
	return inline(city && publisher ? `${city}: ${publisher}` : city || publisher);
}

/** Everything after the title: the venue apparatus, branch for branch as the component sets it. */
function publicationVenue(pub: CvPublication, twin: string): string {
	const volumeIssue = inline(formatVolumeIssueDisplay(pub.volume, pub.issue));
	const vi = volumeIssue ? ` ${volumeIssue}` : '';
	const pages = (separator: string) => (pub.pages ? `${separator}${inline(pub.pages)}` : '');
	const imprint = placeAndPublisher(pub);

	if ((pub.type === 'article' || pub.type === 'bulletin-article') && pub.journal) {
		return `${em(pub.journal)}${vi}${pages(': ')}.`;
	}
	if (pub.type === 'chapter' && pub.book) {
		const editors = pub.editors ? `${inline(formatEditorList(pub.editors))} (eds.), ` : '';
		return `In ${editors}${em(pub.book)}${imprint ? `. ${imprint}` : ''}${pages(', ')}.`;
	}
	if (pub.type === 'book') {
		return `${markdownLink(em(pub.title), twin)}${imprint ? `. ${imprint}.` : '.'}`;
	}
	if (pub.type === 'special-issue' && pub.journal) {
		return `${em(pub.journal)}${vi}.`;
	}
	if (pub.type === 'working-paper') {
		const series = pub.series || pub.journal;
		const seriesPart = series ? `${em(series)}${pub.issue ? ` ${inline(pub.issue)}` : ''}` : '';
		const publisher = pub.publisher && pub.publisher !== series ? `. ${text(pub.publisher)}` : '';
		return `${seriesPart}${pages(': ')}${publisher}.`;
	}
	if (pub.type === 'report') {
		const host = pub.journal
			? `${em(pub.journal)}${vi}`
			: pub.publisher
				? `${em(pub.publisher)}${vi}`
				: '';
		return `${host}${pages(', ')}.`;
	}
	if (pub.type === 'encyclopedia' && pub.encyclopediaTitle) {
		return `In ${em(pub.encyclopediaTitle)}${pub.publisher ? `, ${text(pub.publisher)}` : ''}.`;
	}
	if (pub.type === 'blogpost') {
		const date = pub.dateISO ? formatBlogDate(pub.dateISO) : '';
		return `${link(quoteTitle(pub.title), twin)}${pub.publisher ? `. ${em(pub.publisher)}` : ''}${date ? `, ${inline(date)}` : ''}.`;
	}
	if (pub.type === 'conference-proceedings') {
		return `In ${em(pub.proceedingsTitle)}.`;
	}
	return [
		pub.journal && `In ${em(pub.journal)}.`,
		pub.book && `In ${em(pub.book)}.`,
		pub.publisher && `${text(pub.publisher)}.`
	]
		.filter(Boolean)
		.join(' ');
}

/** "Reviewed in *A*, *B*, and *C*." with the component's separators. */
function reviewedIn(pub: CvPublication): string | undefined {
	const reviews = pub.reviewedBy ?? [];
	if (reviews.length === 0) return undefined;
	const journals = reviews.map((review, index) => {
		const name = em(review.journal);
		const linked = review.url ? markdownLink(name, review.url) : name;
		const separator =
			index < reviews.length - 2 ? ', ' : index === reviews.length - 2 ? ', and ' : '.';
		return `${linked}${separator}`;
	});
	return `Reviewed in ${journals.join('')}`;
}

function publicationEntry(pub: CvPublication): string {
	const twin = markdownUrl(`/publications/${pub.id}`);
	const formattedAuthors = formatCVAuthorList(pub.authors);
	const edited = (pub.type === 'book' && pub.isEditedVolume) || pub.type === 'special-issue';
	const record = [
		formattedAuthors &&
			`${fromHtml(formattedAuthors)}${edited ? ' (eds.),' : terminalPeriod(formattedAuthors)}`,
		pub.type !== 'book' && pub.type !== 'blogpost' && `${link(quoteTitle(pub.title), twin)}.`,
		publicationVenue(pub, twin),
		pub.doi && link(`doi:${pub.doi}`, `https://doi.org/${pub.doi}`),
		pub.url && !pub.doi && outLink('Link', pub.url)
	]
		.filter(Boolean)
		.join(' ');
	return entry(getCVDisplayYear(pub), record, [reviewedIn(pub)]);
}

/** The simplified row the component gives a type outside its ordered list. */
function otherPublicationEntry(pub: CvPublication): string {
	const record = [
		`${link(typesetQuotes(pub.title), markdownUrl(`/publications/${pub.id}`))}.`,
		pub.type && inline(pub.type),
		pub.url && outLink('Link', pub.url)
	]
		.filter(Boolean)
		.join(' ');
	return entry(getCVDisplayYear(pub), record);
}

function publications(): string {
	const { publicationsByType, presentPublicationTypes, otherPublicationTypes } =
		groupPublicationsByType(cvPublicationsByDate);
	const printed = cvPublicationsByDate.filter(isCvPublication);
	if (printed.length === 0) return section('Publications', 'No publications listed.');

	return section(
		'Publications',
		...presentPublicationTypes.map((type) =>
			subsection(
				sentenceCase(getPublicationTypeDisplayName(type)),
				bullets((publicationsByType[type] ?? []).map(publicationEntry))
			)
		),
		subsection(
			'Other',
			bullets(
				otherPublicationTypes.flatMap((type) =>
					(publicationsByType[type as CvPublication['type']] ?? []).map(otherPublicationEntry)
				)
			)
		)
	);
}

// ---------------------------------------------------------------------------
// Grants and fellowships (CVGrants), awards and honours (CVAwards)
// ---------------------------------------------------------------------------

function grants(): string {
	const rows = grantsByDate.map((grant) => {
		const title = grant.url ? outLink(typesetQuotes(grant.title), grant.url) : text(grant.title);
		const unawarded = grant.status && grant.status !== 'Awarded' ? `[${grant.status}]` : '';
		const amount = grant.amount
			? [grant.amount.toLocaleString('en-US'), grant.currency, unawarded].filter(Boolean).join(' ')
			: unawarded;
		const coApplicants = grant.coApplicants ?? [];
		return entry(
			formatCVYearRange(grant.startYear, grant.endYear),
			`${title}, ${text(grant.funder)}.`,
			[
				amount && inline(amount),
				coApplicants.length > 0 &&
					inline(`Co-applicant${coApplicants.length > 1 ? 's' : ''}: ${coApplicants.join(', ')}`),
				grant.details && text(grant.details)
			]
		);
	});
	return section('Grants and fellowships', ledgerOr(rows, 'No grants or fellowships listed.'));
}

function awards(): string {
	const rows = awardsByDate.map((award) =>
		entry(
			award.year,
			`${award.url ? outLink(typesetQuotes(award.title), award.url) : text(award.title)}, ${text(award.institution)}.`,
			[award.details && text(award.details)]
		)
	);
	return section('Awards and honours', ledgerOr(rows, 'No awards or honours listed.'));
}

// ---------------------------------------------------------------------------
// Digital humanities projects (CVDigitalHumanities)
// ---------------------------------------------------------------------------

function projectReviews(project: DigitalHumanitiesSummary): string | undefined {
	const reviews = project.reviews ?? [];
	if (reviews.length === 0) return undefined;
	const citations = reviews.map((review, index) => {
		const isLast = index === reviews.length - 1;
		const citation = fromHtml(
			typesetQuotesInHtml(isLast ? review.text : trimTerminalPeriod(review.text))
		);
		return markdownLink(citation, review.url);
	});
	return `${reviews.length === 1 ? 'Review:' : 'Reviews:'} ${citations.join('; ')}`;
}

function digitalHumanities(): string {
	const rows = sortDhProjectsByRecency(allDhProjectSummaries).map((project) =>
		entry(
			formatCVYearRange(project.years),
			link(typesetQuotes(project.title), markdownUrl(`/digital-humanities/${project.id}`)),
			[
				project.shortDescription && text(project.shortDescription),
				...groupProjectLinks(project).map(
					(group) =>
						`${inline(group.key)}: ${group.links
							.map((projectLink) => outLink(projectLinkText(projectLink), projectLink.url))
							.join(' · ')}`
				),
				projectReviews(project)
			]
		)
	);
	return section(
		'Digital humanities projects',
		ledgerOr(rows, 'No digital humanities projects listed.')
	);
}

// ---------------------------------------------------------------------------
// Talks: invited (CVInvitedTalks), conferences (CVConferences), events (CVEvents)
// ---------------------------------------------------------------------------

const talkKey = (comm: CvCommunication) => getYearFromISODate(comm.dateISO);

/** The talks of each CV section, split by type as the page splits them. */
const talks = splitCvTalks(cvCommunicationsByDate);

/** A talk's title in quotation marks, linked to its Markdown record. */
const talkTitle = (comm: CvCommunication, title = comm.title) =>
	link(quoteTitle(title), markdownUrl(`/communications/${comm.id}`));

/** "Authors. “Title”, *Conference*, Place, 23 September." */
function talkRecord(comm: CvCommunication, title: string, venue: string): string {
	const lead = byline(comm.authors);
	return `${lead ? `${lead} ` : ''}${talkTitle(comm, title)}${venue ? `, ${em(venue)}` : ''}${comm.location ? `, ${text(comm.location)}` : ''}, ${inline(formatDayMonth(comm.dateISO))}.`;
}

function invitedTalks(): string {
	return section(
		'Invited talks',
		bullets(
			talks.invited.map((comm) =>
				entry(talkKey(comm), talkRecord(comm, comm.title, invitedTalkVenue(comm)))
			)
		)
	);
}

function conferences(): string {
	const rows = (list: CvCommunication[], panel = false) =>
		bullets(
			list.map((comm) =>
				entry(
					talkKey(comm),
					talkRecord(comm, panel ? organisedPanelTitle(comm) : comm.title, comm.conference)
				)
			)
		);
	return section(
		'Conference participation',
		subsection('Panels organised', rows(talks.panels, true)),
		subsection('Papers presented', rows(talks.papers)),
		subsection('Posters presented', rows(talks.posters))
	);
}

function events(): string {
	return section(
		'Organisation of academic events',
		bullets(
			talks.events.map((comm) => {
				const lead = byline(comm.authors);
				const date = cvEventDate(comm);
				return entry(
					talkKey(comm),
					`${lead ? `${lead} ` : ''}${talkTitle(comm)}${comm.location ? `, ${text(comm.location)}` : ''}, ${inline(date)}.`
				);
			})
		)
	);
}

// ---------------------------------------------------------------------------
// Teaching experience (CVTeaching)
// ---------------------------------------------------------------------------

function teachingExperience(): string {
	const courses = sortCoursesByYear(teaching);
	const lectures = teachingLectures(guestLectures, talks.teaching);
	if (courses.length === 0) return section('Teaching experience', 'No teaching experience listed.');

	return section(
		'Teaching experience',
		subsection(
			'Instructor',
			bullets(
				courses.map((course) =>
					entry(
						formatCVYearRange(course.year),
						`${strong(course.title)}, ${text(course.institution)}, ${teachingLevelLabel(course.level)}${course.sections ? ` (${inline(course.sections)})` : ''}${course.period ? ` (${inline(course.period)})` : ''}.`
					)
				)
			)
		),
		subsection(
			'Guest lectures and workshops',
			bullets(
				lectures.map((lecture) =>
					entry(
						lecture.year,
						// A talk given as teaching links to its record, as the other talks do.
						`${lecture.talkId ? `**${link(typesetQuotes(lecture.title), markdownUrl(`/communications/${lecture.talkId}`))}**` : strong(lecture.title)}, ${em(lecture.course)}, ${text(lectureHostAndLevel(lecture))}.`
					)
				)
			)
		)
	);
}

// ---------------------------------------------------------------------------
// Research experience (CVResearchExperience)
// ---------------------------------------------------------------------------

function researchExperience(): string {
	const fieldwork = groupFieldworkByPlace(fieldworksByDate).map((item) =>
		entry(item.years.join(', '), text(item.location))
	);
	const roles = researchRolesByDate.map((role) =>
		entry(
			formatCVYearRange(role.startYear, role.endYear),
			`${text(role.title)}, ${text(role.institution)}.`,
			(Array.isArray(role.details) ? role.details : [role.details]).map((detail) => text(detail))
		)
	);
	return section(
		'Research experience',
		subsection('Fieldwork', ledgerOr(fieldwork, 'No fieldwork listed.')),
		subsection('Research roles', ledgerOr(roles, 'No research roles listed.'))
	);
}

// ---------------------------------------------------------------------------
// Service to profession (CVService)
// ---------------------------------------------------------------------------

function service(): string {
	const reviews = realPeerReviews(peerReviewsByDate);
	const memberships = realEditorialMemberships(editorialMembershipsByDate);

	return section(
		'Service to profession',
		subsection(
			'Editorial board memberships',
			bullets(
				memberships.map((member) =>
					entry(member.dateRangeString, `${inline(member.role)}, ${em(member.journal)}.`, [
						member.details && text(member.details)
					])
				)
			)
		),
		subsection(
			'Peer review activities',
			bullets(
				reviews.map((review) => {
					const what =
						review.count && review.count > 1 ? `${review.count} ${review.type}s` : review.type;
					const venue = review.journal
						? ` – ${em(review.journal)}`
						: review.publisher
							? ` – ${text(review.publisher)}`
							: '';
					return entry(review.year, `${inline(what)}${venue}.`, [
						review.details && text(review.details),
						review.publons_record && outLink('Verified on Web of Science', review.publons_record)
					]);
				})
			)
		),
		reviews.length === 0 && memberships.length === 0 && 'No service activities listed.'
	);
}

// ---------------------------------------------------------------------------
// Consulting and legal expertise (CVConsulting)
// ---------------------------------------------------------------------------

function consulting(): string {
	return section(
		'Consulting and legal expertise',
		bullets(
			consultingEngagements.map((item) =>
				entry(
					item.year,
					`${inline(item.role)}, ${inline(item.organization)}.`,
					item.descriptions.map((description) => inline(description))
				)
			)
		)
	);
}

// ---------------------------------------------------------------------------
// Media appearances (CVMedia)
// ---------------------------------------------------------------------------

function media(): string {
	const { podcasts } = talks;

	return section(
		'Media appearances',
		subsection(
			'Podcasts',
			bullets(
				podcasts.map((podcast) =>
					entry(
						talkKey(podcast),
						`${talkTitle(podcast)}${podcast.conference ? `, ${em(podcast.conference)}` : ''}${podcast.episode ? `, ep. ${inline(podcast.episode)}` : ''}. ${inline(formatDayMonth(podcast.dateISO))}.`,
						[
							podcast.doi && `DOI: ${link(podcast.doi, `https://doi.org/${podcast.doi}`)}`,
							podcast.url && outLink('Listen', podcast.url)
						]
					)
				)
			)
		),
		subsection(
			'Interviews and appearances',
			bullets(
				mediaAppearancesByDate.map((appearance) =>
					entry(
						getYearFromISODate(appearance.dateISO),
						`${appearance.type === 'interview' ? 'Interviewed by' : 'Appeared in'} ${em(appearance.outlet)}${appearance.program ? `, ${text(appearance.program)}` : ''}. ${inline(formatDayMonth(appearance.dateISO))}.`,
						[`Topic: ${text(appearance.topic)}`, appearance.url && outLink('Link', appearance.url)]
					)
				)
			)
		),
		mediaAppearancesByDate.length === 0 &&
			podcasts.length === 0 &&
			'No media appearances or podcasts listed.'
	);
}

// ---------------------------------------------------------------------------
// Languages (CVLanguages), affiliations (CVAffiliations), skills (CVComputerSkills)
// ---------------------------------------------------------------------------

function languages(): string {
	const rows = languagesByProficiency.map((language) =>
		entry(language.proficiency, inline(language.name))
	);
	return section('Languages', ledgerOr(rows, 'No languages listed.'));
}

function affiliations(): string {
	const rows = affiliationsByStartDate.map((aff) =>
		entry(
			formatAffiliationPeriod(aff.period),
			`${text(aff.name)}${aff.abbreviation ? ` (${inline(aff.abbreviation)})` : ''}${aff.parentOrganization ? `, ${text(aff.parentOrganization)}` : ''}.`,
			(aff.roles ?? []).map(
				(role) => `${text(role.title)} (${inline(formatAffiliationPeriod(role.period))})`
			)
		)
	);
	return section(
		'Professional affiliations',
		ledgerOr(rows, 'No professional affiliations listed.')
	);
}

function computerSkills(): string {
	return section(
		'Computer skills',
		bullets(skillGroups.map((skill) => entry(skill.category, inline(skill.skills))))
	);
}

// ---------------------------------------------------------------------------
// The document
// ---------------------------------------------------------------------------

/** `/cv.md`: the full CV, section for section as `/cv` prints it. */
export function cvMarkdown(): string {
	return document(
		'# Curriculum vitae',
		header(),
		appointments(),
		education(),
		publications(),
		grants(),
		awards(),
		digitalHumanities(),
		invitedTalks(),
		conferences(),
		events(),
		teachingExperience(),
		researchExperience(),
		service(),
		consulting(),
		media(),
		languages(),
		affiliations(),
		computerSkills()
	);
}
