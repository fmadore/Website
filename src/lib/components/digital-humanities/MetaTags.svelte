<script lang="ts">
	// Zotero-facing metadata for a digital humanities project detail page —
	// Highwire/Dublin Core tags plus a COinS span, mirroring the MetaTags
	// components the publication/communication/activity detail routes carry.
	// A DH project is described as a web resource (DC format, type "webpage").
	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
	import { page } from '$app/state';
	import { author, website } from '$lib/data/siteConfig';
	import { buildCoins, buildHeadTags, toLastFirstFormat } from '$lib/utils/metaTags';
	import BaseMetaTags from '$lib/components/common/BaseMetaTags.svelte';

	let { project }: { project: DigitalHumanitiesProject } = $props();

	const authorLastFirst = toLastFirstFormat(author.name);

	// First 4-digit year of the "years" label ("2023-", "2018-2023") — the
	// project's publication year for citation purposes.
	const projectYear = $derived(project.years?.match(/\d{4}/)?.[0]);

	// Canonical page URL — built from the configured site origin, because at
	// prerender time page.url.origin is the placeholder http://sveltekit-prerender
	// and these tags are baked into the static head Zotero and crawlers consume.
	const currentUrl = $derived(`${website.url}${page.url.pathname}`);

	// COinS field mapping — DC document format, typed as a web page. Zotero
	// saves this as a "Web Page" item with title, creator, date and URL.
	const coinsData = $derived(
		buildCoins([
			['rft_val_fmt', 'info:ofi/fmt:kev:mtx:dc'],
			['rft.type', 'webpage'],
			['rft.title', project.title],
			['rft.creator', authorLastFirst],
			['rft.date', projectYear],
			['rft.source', author.name],
			['rft.identifier', project.linkUrl || currentUrl],
			['rft.description', project.shortDescription],
			['rft.language', 'en']
		])
	);

	// Head tag field mapping — order here is emission order.
	const metaTags = $derived.by(() =>
		buildHeadTags([
			// Highwire Press tags
			{ name: 'citation_title', content: project.title },
			{ name: 'citation_author', content: authorLastFirst },
			{ name: 'citation_publisher', content: author.name },
			{ name: 'citation_year', content: projectYear },
			{ name: 'citation_date', content: projectYear },
			{ name: 'citation_language', content: 'en' },
			{ name: 'citation_keywords', content: project.skills?.join('; ') },
			{ name: 'citation_abstract', content: project.shortDescription },
			{ name: 'citation_public_url', content: currentUrl },
			{ name: 'citation_reference_url', content: project.linkUrl },
			// Dublin Core tags
			{ name: 'DC.title', content: project.title },
			{ name: 'DC.creator', content: authorLastFirst },
			{ name: 'DC.type', content: 'InteractiveResource' },
			{ name: 'DC.publisher', content: author.name },
			{ name: 'DC.description', content: project.shortDescription },
			{ name: 'DC.date', content: projectYear },
			{ name: 'DC.identifier', content: currentUrl },
			{ name: 'DC.language', content: 'en' },
			{ name: 'DC.relation', content: project.linkUrl },
			// Subject tags from the project's skills/methods
			(project.skills ?? []).map((skill) => ({ name: 'DC.subject', content: skill })),
			{ name: 'DC.subject', content: 'Digital Humanities' }
		])
	);
</script>

<BaseMetaTags tags={metaTags} coins={coinsData} />
