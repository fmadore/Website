<script lang="ts">
	import { allDhProjects } from '$lib/data/digital-humanities';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import { groupProjectLinks, projectLinkText } from '$lib/utils/projectLinks';
	import CVSection from './CVSection.svelte';

	// CV ordering: strictly most-recent-first, ignoring the DH-page's
	// featured/order fields. Sort by start year so a focused recent
	// project (e.g. 2023) outranks a long-running older one (2018-24).
	// End year (Infinity for ongoing) breaks ties: an ongoing project
	// beats a closed one with the same start year.
	function parseYears(years: string): { start: number; end: number } {
		const [startStr = '', endStr] = years.split('-');
		const start = parseInt(startStr, 10);
		const ongoing = years.endsWith('-');
		const end = ongoing ? Infinity : endStr ? parseInt(endStr, 10) : start;
		return { start, end };
	}

	const dhProjectsByRecency = [...allDhProjects].sort((a, b) => {
		const ay = parseYears(a.years);
		const by = parseYears(b.years);
		if (ay.start !== by.start) return by.start - ay.start;
		if (ay.end !== by.end) return by.end - ay.end;
		return a.title.localeCompare(b.title);
	});
</script>

<CVSection
	title="Digital Humanities Projects"
	items={dhProjectsByRecency}
	year={(project) => formatCVYearRange(project.years)}
	key={(project) => project.id}
	emptyMessage="No digital humanities projects listed."
>
	{#snippet entry(project)}
		<span class="font-medium">{project.title}</span>
		{#if project.shortDescription}
			<div class="text-sm text-light">{project.shortDescription}</div>
		{/if}
		{#each groupProjectLinks(project) as group (group.type)}
			<!-- Ledger of addresses: mono key, then the sites/repos/datasets it holds. -->
			<div class="dh-links">
				<span class="dh-links-key">{group.key}</span>
				{#each group.links as link, i (link.url)}
					<!-- Non-breaking spaces, not plain ones: Svelte trims literal whitespace
					     at element edges, and the PDF exporter reads these text nodes, so
					     without them the export glues the dot to the preceding address. -->
					{#if i > 0}<span class="dh-links-sep" aria-hidden="true">&nbsp;·&nbsp;</span>{/if}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external project address -->
					<a href={link.url} target="_blank" rel="noopener noreferrer" class:link-url={!link.label}
						>{projectLinkText(link)}</a
					>
				{/each}
			</div>
		{/each}
		{#if project.reviews && project.reviews.length > 0}
			<div class="mt-2 ml-4 text-sm">
				{project.reviews.length === 1 ? 'Review:' : 'Reviews:'}
				{#each project.reviews as review, i (review.url)}
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
					<a
						href={review.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline"
						><!-- eslint-disable svelte/no-at-html-tags -- Safe: review.text is from trusted static project data files -->{@html review.text}<!-- eslint-enable svelte/no-at-html-tags --></a
					><!-- eslint-enable svelte/no-navigation-without-resolve -->{#if i < project.reviews.length - 1};
					{/if}
				{/each}
			</div>
		{/if}
	{/snippet}
</CVSection>

<style>
	/* Addresses are apparatus — DATA voice, set below the record they belong to. */
	.dh-links {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		/* Column spacing comes from the separator's own non-breaking spaces, so
		 * only the wrapped-line gap is set here. */
		row-gap: var(--space-1);
		margin-top: var(--space-1);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: 0.04em;
		line-height: var(--line-height-snug);
	}

	/* Key column of the row — uppercase mono, quiet ink. */
	.dh-links-key {
		margin-right: var(--space-2);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--color-text-light);
	}

	.dh-links-sep {
		color: var(--color-text-muted);
	}

	/* Anchors need no rules of their own: colour comes from `#cv-content a`
	 * (accent) and long URLs already wrap via the base reset's overflow-wrap.
	 * The `.link-url` class they may carry is read by the CV page's print
	 * rules, which skip appending an href to text that is already the URL. */
</style>
