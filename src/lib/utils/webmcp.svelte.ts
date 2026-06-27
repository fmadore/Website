/**
 * WebMCP integration.
 *
 * Registers a small set of read-only "tools" with the browser's WebMCP runtime
 * (`navigator.modelContext`) so that AI agents browsing the site can query its
 * content reliably — searching publications and talks/events, reading their
 * details, listing research/digital-humanities projects, and fetching
 * author/contact information — instead of scraping the DOM.
 *
 * The API is progressively enhanced: when no WebMCP runtime is present the hook is
 * a no-op. Tools are registered when the layout mounts and unregistered on cleanup.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/ — `navigator.modelContext`.
 */

import { browser } from '$app/environment';
import { website } from '$lib/data/siteConfig';

// ---------------------------------------------------------------------------
// Minimal typings for the (still-experimental) WebMCP API.
// ---------------------------------------------------------------------------

interface ToolContentItem {
	type: 'text';
	text: string;
}

interface ToolResult {
	content: ToolContentItem[];
	isError?: boolean;
}

interface ToolDescriptor {
	name: string;
	description: string;
	inputSchema: Record<string, unknown>;
	execute: (args: Record<string, unknown>) => Promise<ToolResult> | ToolResult;
}

interface ToolRegistration {
	unregister?: () => void;
}

interface ModelContext {
	registerTool?: (tool: ToolDescriptor) => ToolRegistration | undefined;
}

const SITE = website.url;

/** Wrap a JSON-serialisable value as a WebMCP text result. */
function jsonResult(value: unknown): ToolResult {
	return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
}

/** Wrap an error message as a WebMCP error result. */
function errorResult(message: string): ToolResult {
	return { content: [{ type: 'text', text: message }], isError: true };
}

// ---------------------------------------------------------------------------
// Tool definitions.
//
// Data modules are imported lazily inside `execute` so they stay out of the
// initial bundle and are only loaded when an agent actually calls a tool.
// ---------------------------------------------------------------------------

function buildTools(): ToolDescriptor[] {
	return [
		{
			name: 'search_publications',
			description:
				"Search Frédérick Madore's academic publications (books, journal articles, book chapters, edited volumes, reports, and encyclopedia entries). Filter by free-text query, publication type, and/or year. Returns matching publications with titles, years, types, authors, and URLs.",
			inputSchema: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description: 'Free-text search matched against title, authors, abstract, and tags.'
					},
					type: {
						type: 'string',
						description: 'Restrict to a publication type.',
						enum: [
							'book',
							'article',
							'chapter',
							'special-issue',
							'report',
							'encyclopedia',
							'blogpost',
							'phd-dissertation',
							'masters-thesis',
							'conference-proceedings',
							'bulletin-article'
						]
					},
					year: {
						type: 'integer',
						description: 'Restrict to publications from this year.'
					},
					limit: {
						type: 'integer',
						description: 'Maximum number of results to return (default 10, maximum 50).',
						minimum: 1,
						maximum: 50
					}
				},
				required: []
			},
			async execute(args) {
				const { publicationsByDate } = await import('$lib/data/publications/index');
				const query = typeof args.query === 'string' ? args.query.toLowerCase().trim() : '';
				const type = typeof args.type === 'string' ? args.type : '';
				const year = typeof args.year === 'number' ? args.year : undefined;
				const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);

				const results = publicationsByDate
					.filter((pub) => {
						if (type && pub.type !== type) return false;
						if (year !== undefined && pub.year !== year) return false;
						if (query) {
							const haystack = [
								pub.title,
								pub.authors?.join(' '),
								pub.abstract ?? '',
								pub.tags?.join(' ') ?? ''
							]
								.join(' ')
								.toLowerCase();
							if (!haystack.includes(query)) return false;
						}
						return true;
					})
					.slice(0, limit)
					.map((pub) => ({
						id: pub.id,
						title: pub.title,
						type: pub.type,
						year: pub.year,
						authors: pub.authors,
						url: `${SITE}/publications/${pub.id}`,
						doi: pub.doi
					}));

				return jsonResult({ count: results.length, results });
			}
		},
		{
			name: 'get_publication_details',
			description:
				'Get full details for a single publication by its ID (as returned by search_publications). Includes the abstract, citation metadata, and links.',
			inputSchema: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'The publication ID, e.g. "religious-activism-campuses".'
					}
				},
				required: ['id']
			},
			async execute(args) {
				const id = typeof args.id === 'string' ? args.id : '';
				if (!id) return errorResult('A publication "id" is required.');

				const { allPublications } = await import('$lib/data/publications/index');
				const pub = allPublications.find((p) => p.id === id);
				if (!pub) return errorResult(`No publication found with id "${id}".`);

				return jsonResult({
					id: pub.id,
					title: pub.title,
					type: pub.type,
					authors: pub.authors,
					year: pub.year,
					date: pub.date,
					language: pub.language,
					publisher: pub.publisher,
					journal: pub.journal,
					book: pub.book,
					volume: pub.volume,
					issue: pub.issue,
					pages: pub.pages,
					doi: pub.doi,
					isbn: pub.isbn,
					abstract: pub.abstract,
					tags: pub.tags,
					url: `${SITE}/publications/${pub.id}`,
					externalUrl: pub.url
				});
			}
		},
		{
			name: 'search_communications',
			description:
				"Search Frédérick Madore's talks and events (conference papers, invited lectures, seminars, workshops, panels, and podcasts). Filter by free-text query, type, and/or year. Returns matching talks with titles, dates, venues, and URLs.",
			inputSchema: {
				type: 'object',
				properties: {
					query: {
						type: 'string',
						description:
							'Free-text search matched against title, conference/venue, location, abstract, and tags.'
					},
					type: {
						type: 'string',
						description: 'Restrict to a type of talk or event.',
						enum: ['conference', 'workshop', 'seminar', 'lecture', 'panel', 'event', 'podcast']
					},
					year: {
						type: 'integer',
						description: 'Restrict to talks from this year.'
					},
					limit: {
						type: 'integer',
						description: 'Maximum number of results to return (default 10, maximum 50).',
						minimum: 1,
						maximum: 50
					}
				},
				required: []
			},
			async execute(args) {
				const { communicationsByDate } = await import('$lib/data/communications/index');
				const query = typeof args.query === 'string' ? args.query.toLowerCase().trim() : '';
				const type = typeof args.type === 'string' ? args.type : '';
				const year = typeof args.year === 'number' ? args.year : undefined;
				const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 50);

				const results = communicationsByDate
					.filter((comm) => {
						if (type && comm.type !== type) return false;
						if (year !== undefined && comm.year !== year) return false;
						if (query) {
							const haystack = [
								comm.title,
								comm.conference ?? '',
								comm.location ?? '',
								comm.abstract ?? '',
								comm.tags?.join(' ') ?? ''
							]
								.join(' ')
								.toLowerCase();
							if (!haystack.includes(query)) return false;
						}
						return true;
					})
					.slice(0, limit)
					.map((comm) => ({
						id: comm.id,
						title: comm.title,
						type: comm.type,
						conference: comm.conference,
						location: comm.location,
						country: comm.country,
						year: comm.year,
						url: `${SITE}/communications/${comm.id}`
					}));

				return jsonResult({ count: results.length, results });
			}
		},
		{
			name: 'get_communication_details',
			description:
				'Get full details for a single talk or event by its ID (as returned by search_communications). Includes the abstract, venue, panel, participants, and links.',
			inputSchema: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						description: 'The communication ID, e.g. "madore-2025-perspectives-in-motion".'
					}
				},
				required: ['id']
			},
			async execute(args) {
				const id = typeof args.id === 'string' ? args.id : '';
				if (!id) return errorResult('A communication "id" is required.');

				const { allCommunications } = await import('$lib/data/communications/index');
				const comm = allCommunications.find((c) => c.id === id);
				if (!comm) return errorResult(`No talk or event found with id "${id}".`);

				return jsonResult({
					id: comm.id,
					title: comm.title,
					type: comm.type,
					authors: comm.authors,
					year: comm.year,
					date: comm.date,
					conference: comm.conference,
					panelTitle: comm.panelTitle,
					location: comm.location,
					country: comm.country,
					language: comm.language,
					abstract: comm.abstract,
					papers: comm.papers,
					participants: comm.participants,
					project: comm.project,
					tags: comm.tags,
					doi: comm.doi,
					url: `${SITE}/communications/${comm.id}`,
					externalUrl: comm.url,
					slidesUrl: comm.slidesUrl
				});
			}
		},
		{
			name: 'list_research_projects',
			description:
				"List Frédérick Madore's research projects and digital humanities projects, with short descriptions and URLs.",
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			},
			async execute() {
				const { allDhProjects } = await import('$lib/data/digital-humanities');
				const research = [
					{
						id: 'islams-peripheries-dh-ai-west-africa-central-asia',
						title:
							"Islam's 'Peripheries': Digital Humanities, Algorithmic Analysis, and AI in West Africa and Central Asia"
					},
					{
						id: 'dh-ai-african-studies',
						title: 'Digital Humanities and Artificial Intelligence in African Studies'
					},
					{
						id: 'religious-activism-campuses-togo-benin',
						title: 'Religious Activism on Campuses in Togo and Benin'
					},
					{
						id: 'muslim-minorities-southern-cities-benin-togo',
						title: 'Muslim Minorities in Southern Cities of Benin and Togo'
					},
					{
						id: 'youth-womens-islamic-activism-cote-divoire-burkina-faso',
						title: "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso"
					}
				].map((p) => ({ ...p, url: `${SITE}/research/${p.id}` }));

				const digitalHumanities = allDhProjects.map((p) => ({
					id: p.id,
					title: p.title,
					shortDescription: p.shortDescription,
					url: `${SITE}/digital-humanities/${p.id}`
				}));

				return jsonResult({ research, digitalHumanities });
			}
		},
		{
			name: 'get_author_info',
			description:
				'Get information about the site owner, Frédérick Madore: name, academic position, affiliation, contact email, and scholarly/social profile links.',
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			},
			async execute() {
				const { author, address, contact, socialLinks } = await import('$lib/data/siteConfig');
				return jsonResult({
					name: author.name,
					fullName: author.fullName,
					position: author.position,
					affiliation: {
						institution: address.institution,
						department: address.department,
						city: address.city,
						country: address.country
					},
					email: contact.email,
					website: SITE,
					profiles: {
						orcid: socialLinks.orcid.url,
						googleScholar: socialLinks.googleScholar.url,
						researchGate: socialLinks.researchGate.url,
						github: socialLinks.github.url,
						linkedIn: socialLinks.linkedIn.url,
						bluesky: socialLinks.bluesky.url
					}
				});
			}
		}
	];
}

/**
 * Registers WebMCP tools for the current document.
 * Must be called at component top-level (uses $effect).
 */
export function useWebMcp(): void {
	$effect(() => {
		if (!browser) return;

		const modelContext = (navigator as Navigator & { modelContext?: ModelContext }).modelContext;
		if (!modelContext || typeof modelContext.registerTool !== 'function') return;

		const registrations: ToolRegistration[] = [];
		for (const tool of buildTools()) {
			try {
				const registration = modelContext.registerTool(tool);
				if (registration) registrations.push(registration);
			} catch (err) {
				if (import.meta.env.DEV) console.error('[WebMCP] Failed to register tool:', tool.name, err);
			}
		}

		return () => {
			for (const registration of registrations) {
				try {
					registration.unregister?.();
				} catch {
					// Ignore cleanup failures — the document is going away anyway.
				}
			}
		};
	});
}
