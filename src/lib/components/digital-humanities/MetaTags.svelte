<script lang="ts">
	// Zotero-facing metadata for a digital humanities project detail page —
	// Highwire/Dublin Core tags plus a COinS span, mirroring the MetaTags
	// components the publication/communication/activity detail routes carry.
	// A DH project is described as a web resource (DC format, type "webpage").
	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
	import { page } from '$app/state';
	import { author } from '$lib/data/siteConfig';
	import {
		type MetaTag,
		createConditionalTag,
		createCoinsParams,
		deduplicateAndFilterTags,
		toLastFirstFormat
	} from '$lib/utils/metaTags';
	import BaseMetaTags from '$lib/components/common/BaseMetaTags.svelte';

	let { project }: { project: DigitalHumanitiesProject } = $props();

	const authorLastFirst = toLastFirstFormat(author.name);

	// First 4-digit year of the "years" label ("2023-", "2018-2023") — the
	// project's publication year for citation purposes.
	const projectYear = $derived(project.years?.match(/\d{4}/)?.[0]);

	const currentUrl = $derived(`${page.url.origin}${page.url.pathname}`);

	// COinS — DC document format, typed as a web page. Zotero saves this as a
	// "Web Page" item with title, creator, date and URL.
	const coinsData = $derived.by((): string => {
		const params = createCoinsParams();
		params.set('rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc');
		params.set('rft.type', 'webpage');
		params.set('rft.title', project.title);
		params.set('rft.creator', authorLastFirst);
		if (projectYear) params.set('rft.date', projectYear);
		params.set('rft.source', author.name);
		params.set('rft.identifier', project.linkUrl || currentUrl);
		if (project.shortDescription) params.set('rft.description', project.shortDescription);
		params.set('rft.language', 'en');
		return params.toString();
	});

	const metaTags = $derived.by((): MetaTag[] => {
		const tags: MetaTag[] = [];

		// Highwire Press tags
		tags.push(
			{ name: 'citation_title', content: project.title },
			{ name: 'citation_author', content: authorLastFirst },
			{ name: 'citation_publisher', content: author.name },
			...createConditionalTag('citation_year', projectYear),
			...createConditionalTag('citation_date', projectYear),
			{ name: 'citation_language', content: 'en' },
			...createConditionalTag('citation_keywords', project.skills?.join('; ')),
			...createConditionalTag('citation_abstract', project.shortDescription),
			{ name: 'citation_public_url', content: currentUrl },
			...createConditionalTag('citation_reference_url', project.linkUrl)
		);

		// Dublin Core tags
		tags.push(
			{ name: 'DC.title', content: project.title },
			{ name: 'DC.creator', content: authorLastFirst },
			{ name: 'DC.type', content: 'InteractiveResource' },
			{ name: 'DC.publisher', content: author.name },
			...createConditionalTag('DC.description', project.shortDescription),
			...createConditionalTag('DC.date', projectYear),
			{ name: 'DC.identifier', content: currentUrl },
			{ name: 'DC.language', content: 'en' },
			...createConditionalTag('DC.relation', project.linkUrl)
		);

		// Subject tags from the project's skills/methods
		if (project.skills) {
			tags.push(...project.skills.map((skill) => ({ name: 'DC.subject', content: skill })));
		}
		tags.push({ name: 'DC.subject', content: 'Digital Humanities' });

		return deduplicateAndFilterTags(tags);
	});
</script>

<BaseMetaTags tags={metaTags} coins={coinsData} />
