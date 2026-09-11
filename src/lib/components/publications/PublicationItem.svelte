<script lang="ts">
	import type { PublicationSummary } from '$lib/types/publication';
	import { resolve } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	// Import the necessary functions from the new formatter
	import {
		formatCitation,
		formatReferenceText,
		getAuthorsArray
	} from '$lib/utils/citationFormatter';
	import { formatAuthorsWithEtAl } from '$lib/utils/nameUtils';
	import { author as siteAuthor } from '$lib/data/siteConfig';
	import { titleLangAttr } from '$lib/utils/languageUtils';
	import { isForthcoming } from '$lib/utils/date-formatter';
	import BibliographyRow from '$lib/components/molecules/BibliographyRow.svelte';
	import type {
		BibliographyAction,
		BibliographyNote
	} from '$lib/components/molecules/BibliographyRow.svelte';

	interface Props {
		/** A summary: the list never needs the abstract or the citation list. */
		publication: PublicationSummary;
		/** Position in the list, used only to load the first plates eagerly. */
		index?: number;
		/**
		 * The hanging year to print in the left column. The parent passes it
		 * only for the first entry of each year (so the ledger reads the year
		 * once, then blank rows beneath). Pass `null` / omit to leave it blank.
		 */
		yearLabel?: string | number | null;
		/**
		 * Mark this entry as the current/featured lead —
		 * pine kind eyebrow, larger Archivo year, and (if a cover exists)
		 * an inline plate. Reserved for the newest/featured record.
		 */
		featured?: boolean;
		/**
		 * Forwarded to `BibliographyRow`: the list owns the one live region that
		 * announces the result of a copy, so the row reports upward instead of
		 * carrying a live region of its own.
		 */
		oncopystate?: (state: 'copied' | 'failed') => void;
	}

	let { publication, index, yearLabel = null, featured = false, oncopystate }: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Citation count for the inline badge
	const citationCount = $derived(publication.citedByCount);

	// The label the kind eyebrow falls back to for an unmapped type.
	const formattedCitation = $derived(formatCitation(publication));
	const publicationHref = $derived(resolve('/publications/[id]', { id: publication.id }));

	// Books, edited volumes and special issues set their title in italic serif —
	// the convention for a standalone published work vs. an article within one.
	const isItalicTitle = $derived(
		publication.type === 'book' ||
			publication.type === 'special-issue' ||
			publication.isEditedVolume === true ||
			publication.isEditedWork === true
	);

	// Kind eyebrow — the mono dateline that opens a bibliography row. A short,
	// finding-aid label per type ("MONOGRAPH · BOOK", "JOURNAL ARTICLE",
	// "SPECIAL ISSUE · CO-EDITED"), derived from structured fields only.
	const kindLabel = $derived.by(() => {
		const t = publication.type;
		switch (t) {
			case 'book':
				return publication.isEditedVolume ? 'Edited Volume · Book' : 'Monograph · Book';
			case 'article':
				return 'Journal Article';
			case 'bulletin-article':
				return 'Bulletin Article';
			case 'chapter':
				return 'Book Chapter';
			case 'special-issue':
				return 'Special Issue · Co-edited';
			case 'working-paper':
				return 'Working Paper';
			case 'report':
				return 'Report';
			case 'encyclopedia':
				return 'Encyclopedia Entry';
			case 'blogpost':
				return 'Blog Post';
			case 'phd-dissertation':
				return 'PhD Dissertation';
			case 'masters-thesis':
				return "Master's Thesis";
			case 'conference-proceedings':
				return 'Conference Proceedings';
			default:
				return formattedCitation.typeLabel;
		}
	});

	// Open access is an authored fact (`openAccess`), never inferred from having
	// a link: most bare `url`s go to a publisher's catalogue page, which is a
	// paywall. Same rule as the detail page.
	const isOpenAccess = $derived(publication.openAccess === true);
	const openHref = $derived(
		publication.doi ? `https://doi.org/${publication.doi}` : (publication.url ?? undefined)
	);

	// Language tag for the eyebrow — only surfaced when it isn't plain English.
	const languageNote = $derived(
		publication.language && publication.language !== 'English' ? publication.language : ''
	);

	// A one-line standfirst under the title: a trimmed abstract if present.
	// BibliographyRow typesets what it is handed.
	const bibStandfirst = $derived(
		publication.abstractExcerpt ? truncateAbstract(publication.abstractExcerpt, 180) : ''
	);

	// Open access is a fact about the record, so it prints in the kind eyebrow
	// beside the type — exactly where the record page's masthead prints it. As
	// an action label it could only appear when there was no DOI to name
	// instead, which silently withheld it from 21 of the 27 open-access records.
	// Forthcoming is a fact of the same kind, and the one the reader most needs
	// before citing: the row's year column prints the publication year of a work
	// that has not appeared yet, so without the note the eyebrow says nothing
	// the record page says plainly.
	const bibNotes = $derived<BibliographyNote[]>([
		...(isOpenAccess ? [{ label: 'Open Access', icon: 'academicons:open-access' }] : []),
		...(isForthcoming(publication) ? [{ label: 'Forthcoming' }] : [])
	]);

	// Right-aligned action column: one primary action naming where the link
	// actually goes, marked for the kind of address it is — the DOI glyph for a
	// resolver, the globe for a web address. The label says what is at the end
	// of it. BibliographyRow appends the "Cite" control.
	const bibAction = $derived<BibliographyAction | null>(
		!openHref
			? null
			: publication.doi
				? { href: openHref, label: 'DOI', primary: true, icon: 'academicons:doi' }
				: {
						href: openHref,
						label: isOpenAccess ? 'Full text' : 'Publisher',
						primary: true,
						icon: 'mdi:web'
					}
	);
	const bibActions = $derived<BibliographyAction[]>(bibAction ? [bibAction] : []);

	interface DisplayListItem {
		name: string;
		isClickable: boolean;
	}

	// Reactive computation for Author/Editor list (not HTML string)
	const displayData = $derived.by(() => {
		const type = publication.type;
		const authors = publication.authors;
		const editors = publication.editors;

		let items: DisplayListItem[] = [];
		let listPrefix = ''; // Reset prefix

		if (
			type === 'book' ||
			type === 'article' ||
			type === 'bulletin-article' ||
			type === 'chapter' ||
			type === 'encyclopedia' ||
			type === 'report' ||
			type === 'working-paper' ||
			type === 'blogpost' ||
			type === 'phd-dissertation' ||
			type === 'masters-thesis' ||
			type === 'conference-proceedings'
		) {
			if (authors) {
				const authorsArray = getAuthorsArray(authors);
				items = authorsArray.map((author) => ({
					name: author,
					isClickable: false // No longer needed, but keep structure for now
				}));
			}
		} else if (type === 'special-issue') {
			if (editors) {
				listPrefix = 'Edited by ';
				if (typeof editors === 'string') {
					const editorsArray = editors
						.split(' and ')
						.flatMap((part) => part.split(', '))
						.map((name) => name.trim())
						.filter(Boolean);
					items = editorsArray.map((editor) => ({
						name: editor,
						isClickable: false // No longer needed
					}));
				}
				// Add logic for array editors if needed
			}
		}
		// Handle advisors separately in the template as before
		// Handle prefacedBy separately in the template as before

		// Build the authorString: ", " between entries, " and " before the last.
		// A collective byline (two dozen signatories) collapses to "et al." so
		// the row stays a bibliography entry rather than a page of names; the
		// site owner is held in view wherever they sit in the running order.
		const builtString = formatAuthorsWithEtAl(
			items.map((item) => item.name),
			{ mustInclude: siteAuthor.name }
		);

		return {
			displayList: items,
			listPrefix,
			authorString: builtString
		};
	});
</script>

<BibliographyRow
	href={publicationHref}
	{kindLabel}
	{languageNote}
	kindNotes={bibNotes}
	title={publication.title}
	titleLang={titleLangAttr(publication.language)}
	italicTitle={isItalicTitle}
	byline={displayData.authorString ? `${displayData.listPrefix}${displayData.authorString}` : ''}
	standfirst={bibStandfirst}
	image={publication.image}
	imageAlt="Cover — {publication.title}"
	imageWidth={200}
	imageHeight={280}
	loading={imageLoading}
	actions={bibActions}
	reference={() => formatReferenceText(publication, { doi: true })}
	citedCount={citationCount}
	{yearLabel}
	{featured}
	{oncopystate}
/>
