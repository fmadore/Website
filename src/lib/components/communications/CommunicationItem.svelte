<script lang="ts">
	import type { CommunicationSummary } from '$lib/types/communication';
	import { resolve } from '$app/paths';
	import { truncateAbstract } from '$lib/utils/textUtils';
	import { formatCommunicationCitation } from '$lib/utils/citationFormatter';
	import { titleLangAttr } from '$lib/utils/languageUtils';
	import { COMMUNICATION_TYPE_LIST_LABELS } from '$lib/utils/typeUtils';
	import BibliographyRow from '$lib/components/molecules/BibliographyRow.svelte';
	import type { BibliographyAction } from '$lib/components/molecules/BibliographyRow.svelte';

	interface Props {
		/** A summary: the list never needs the full abstract. */
		communication: CommunicationSummary;
		/** Position in the list, used only to load the first plates eagerly. */
		index?: number;
		/** The hanging year, printed once per year-group by the parent. */
		yearLabel?: string | number | null;
		/** Mark this entry as the featured lead of the list. */
		featured?: boolean;
	}

	let { communication, index, yearLabel = null, featured = false }: Props = $props();

	// Optimize loading for above-the-fold images (first 3 items)
	const imageLoading = $derived((index ?? 0) < 3 ? 'eager' : 'lazy');

	// Helper to format language display
	const languageDisplay = $derived.by(() => {
		if (!communication?.language) return null;
		const langs = Array.isArray(communication.language)
			? communication.language
			: [communication.language];

		// If it's only English, don't show anything
		if (langs.length === 1 && langs[0] === 'English') return null;

		// If multiple languages (bilingual/multilingual), show all
		if (langs.length > 1) {
			return langs.join(', ');
		}

		// Single non-English language
		return langs[0];
	});

	// Format the citation details (formatCommunicationCitation typesets its own
	// output, so the venue line arrives in the display register already).
	const citationDetails = $derived(formatCommunicationCitation(communication));

	const detailHref = $derived(resolve(`/communications/${communication.id}`));

	const kindLabel = $derived(
		COMMUNICATION_TYPE_LIST_LABELS[communication.type ?? 'conference'] ?? 'Academic event'
	);
	// Venue line (conference · city · country) — the finding-aid byline.
	const venueLine = $derived(citationDetails);
	// A one-line standfirst for the featured lead: a trimmed abstract if present.
	// The excerpt truncates exactly as the full abstract would at this length
	// (summaries.test.ts holds that contract).
	const bibStandfirst = $derived(
		communication.abstractExcerpt ? truncateAbstract(communication.abstractExcerpt, 180) : ''
	);
	// Right-aligned action column: primary material (slides/other), an optional
	// DOI; BibliographyRow appends the internal "Details" link.
	const bibActions = $derived.by(() => {
		const list: BibliographyAction[] = [];
		if (communication.slidesUrl)
			list.push({ href: communication.slidesUrl, label: 'Slides', primary: true });
		else if (communication.url)
			list.push({ href: communication.url, label: 'Materials', primary: true });
		if (communication.doi)
			list.push({
				href: `https://doi.org/${communication.doi}`,
				label: 'DOI',
				icon: 'academicons:doi',
				// The first action in the column is the primary one (as before).
				primary: list.length === 0
			});
		return list;
	});
</script>

<!-- Square plate (conference logos/seals, not portrait covers) via plateAspect. -->
<BibliographyRow
	href={detailHref}
	{kindLabel}
	languageNote={languageDisplay}
	title={communication.title}
	titleLang={titleLangAttr(communication.language)}
	byline={venueLine}
	standfirst={bibStandfirst}
	image={communication.image}
	imageAlt=""
	imageWidth={200}
	imageHeight={200}
	plateAspect="1 / 1"
	loading={imageLoading}
	actions={bibActions}
	{yearLabel}
	{featured}
/>
