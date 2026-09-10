<script lang="ts">
	import { allDhProjects } from '$lib/data/digital-humanities';
	import { formatCVYearRange, trimTerminalPeriod } from '$lib/utils/cvFormatters';
	import { groupProjectLinks, projectLinkText } from '$lib/utils/projectLinks';
	import { typesetQuotes, typesetQuotesInHtml } from '$lib/utils/typesetQuotes';
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
		<span class="font-medium">{typesetQuotes(project.title)}</span>
		{#if project.shortDescription}
			<div class="text-sm text-light">{typesetQuotes(project.shortDescription)}</div>
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
						>{projectLinkText(link)}<span class="sr-only"> (opens in new tab)</span></a
					>
				{/each}
			</div>
		{/each}
		{#if project.reviews && project.reviews.length > 0}
			<div class="mt-2 ml-4 text-sm">
				{project.reviews.length === 1 ? 'Review:' : 'Reviews:'}
				{#each project.reviews as review, i (review.url)}
					{@const isLast = i === project.reviews.length - 1}
					<!-- Citations are separated by semicolons, so all but the last shed
					     their terminal full stop rather than reading "(2023).;". -->
					<!-- eslint-disable svelte/no-navigation-without-resolve -- external link -->
					<a
						href={review.url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-primary hover:underline"
						><!-- eslint-disable svelte/no-at-html-tags -- Safe: review.text is from trusted static project data files -->{@html typesetQuotesInHtml(
							isLast ? review.text : trimTerminalPeriod(review.text)
						)}<!-- eslint-enable svelte/no-at-html-tags --><span class="sr-only">
							(opens in new tab)</span
						></a
					><!-- eslint-enable svelte/no-navigation-without-resolve -->{#if !isLast}<span
							class="review-sep">;&nbsp;</span
						>{/if}
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
		 * only the wrapped-line gap is set here — and it is sized so that two
		 * addresses on successive lines sit one hit box apart: the 24px target
		 * below overhangs its line by half the difference on each side, and this
		 * gap is exactly that difference, so neighbouring targets touch but
		 * never overlap. A row that does not wrap never pays it. */
		row-gap: calc(var(--space-6) - 1lh);
		margin-top: var(--space-1);
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		letter-spacing: var(--tracking-figures);
		line-height: var(--line-height-snug);
	}

	/* Consecutive groups (Site, then Repository) are stacks of targets too, so
	 * they take the same 24px pitch as wrapped lines; the first group keeps the
	 * plain interval, since the description above it is not a target. */
	.dh-links + .dh-links {
		margin-top: calc(var(--space-6) - 1lh);
	}

	/* Key column of the row — uppercase mono, quiet ink. */
	.dh-links-key {
		margin-right: var(--space-2);
		font-weight: var(--font-weight-bold);
		text-transform: uppercase;
		letter-spacing: var(--tracking-eyebrow);
		color: var(--color-text-light);
	}

	.dh-links-sep {
		color: var(--color-text-muted);
	}

	/* Anchors need no rules of their own: colour comes from `#cv-content a`
	 * (accent) and long URLs already wrap via the base reset's overflow-wrap.
	 * The `.link-url` class they may carry is read by the CV page's print
	 * rules, which skip appending an href to text that is already the URL. */

	/* Every address is a 24px-tall target on every pointer (WCAG 2.5.8): the
	 * mono 2xs line is ~15px on its own. The box grows through padding and
	 * gives the growth back through margin, so a single-line row keeps its
	 * rhythm and the print/PDF output is untouched; only a row whose addresses
	 * wrap opens up, by the row gap above. The 44px coarse-pointer floor that
	 * `.ledger-action` takes is deliberately not applied here: these are
	 * inline addresses that wrap, and 44px boxes on a 24px pitch would overlap
	 * each other and the line above. */
	.dh-links a {
		display: inline-block;
		padding-block: calc((var(--space-6) - 1lh) / 2);
		margin-block: calc((1lh - var(--space-6)) / 2);
	}
</style>
