<script lang="ts">
	import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
	import { base, resolve } from '$app/paths';

	/**
	 * Featured DH projects — the "FEATURED" module of the Ink + Signal
	 * digital-humanities index. Two projects side by side (grid 1fr 1fr) with a
	 * 1px hairline drawn between the columns and a 3px section rule opening the
	 * block. Each cell is a plate (image top), a mono eyebrow marking the
	 * flagship / newest project, an Archivo title, a serif description, a
	 * data-voice stat row, tech-stack chips and an accent "EXPLORE PROJECT →".
	 *
	 * The project data model has no structured stats field, so the headline
	 * figures below are surfaced from figures that already live in each
	 * project's own prose (shortDescription / description) — real data, not
	 * invented. Projects without a known stat line simply omit the row.
	 */

	let { projects = [] }: { projects: DigitalHumanitiesProject[] } = $props();

	// A stat is a single "value + label" pair; the value is set in the accent
	// (pine) when it is the headline figure for the record.
	type Stat = { value: string; label: string; accent?: boolean };

	// Headline figures, keyed by project id, drawn from each project's own text.
	// Only the two featured projects need entries; anything unmatched degrades
	// to no stat row.
	const STATS: Record<string, Stat[]> = {
		iwac: [
			{ value: '14,700+', label: 'Items', accent: true },
			{ value: '6', label: 'Countries' },
			{ value: '4,600+', label: 'Index entries' }
		],
		amira: [
			{ value: '4,000', label: 'Research items', accent: true },
			{ value: '90+', label: 'Projects' },
			{ value: '42', label: 'Countries' }
		]
	};

	// An ongoing project ends its year span with a dash ("2023-", "2026-").
	function isOngoing(years: string): boolean {
		return /[-–—]\s*$/.test(years.trim());
	}

	// "2023-" → "2023 —" for the eyebrow; a closed year is left as-is.
	function formatYears(years: string): string {
		return isOngoing(years) ? `${years.replace(/[-–—]\s*$/, '').trim()} —` : years.trim();
	}

	// Skill chip → catalogue filter URL (mirrors the /digital-humanities page),
	// so a featured project's skills activate the same skill filter/sort.
	function skillHref(skill: string): string {
		return `${base}/digital-humanities?skill=${encodeURIComponent(skill)}`;
	}

	const processedProjects = $derived(
		projects.map((project, i) => {
			const isExternal =
				project.linkUrl &&
				(project.linkUrl.startsWith('http://') || project.linkUrl.startsWith('https://'));
			const internalPath = `/digital-humanities/${project.id}`;
			const finalLinkUrl = isExternal
				? project.linkUrl!
				: resolve(internalPath as `/digital-humanities/${string}`);
			const linkTarget = isExternal ? '_blank' : '_self';
			const actionText = isExternal ? 'Visit site ↗' : 'Explore project →';

			// The first featured project is the flagship; the newest gets NEW.
			const badge = i === 0 ? 'Flagship' : 'New';

			return {
				...project,
				imageUrl: `${base}${project.imageUrl.startsWith('/') ? project.imageUrl : '/' + project.imageUrl}`,
				finalLinkUrl,
				linkTarget,
				actionText,
				badge,
				yearsLabel: formatYears(project.years),
				stats: STATS[project.id] ?? []
			};
		})
	);
</script>

{#if processedProjects.length > 0}
	<section class="featured section--flush scroll-reveal" aria-labelledby="dh-featured-heading">
		<div class="featured-head">
			<span class="featured-label" id="dh-featured-heading">Featured</span>
		</div>

		<div class="featured-grid grid-stagger">
			{#each processedProjects as project (project.id)}
				<article class="featured-cell">
					<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved URL -->
					{#if project.imageUrl}
						<a
							class="featured-media"
							href={project.finalLinkUrl}
							target={project.linkTarget}
							rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
							tabindex="-1"
							aria-hidden="true"
						>
							<img
								class="plate featured-plate"
								src={project.imageUrl}
								alt=""
								width="1280"
								height="720"
								loading="lazy"
								decoding="async"
							/>
						</a>
					{/if}
					<!-- eslint-enable svelte/no-navigation-without-resolve -->

					<p class="eyebrow featured-eyebrow">
						{project.yearsLabel} · {project.badge}
					</p>

					<h2 class="featured-title">
						<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved URL -->
						<a
							href={project.finalLinkUrl}
							target={project.linkTarget}
							rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
						>
							{project.title}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</h2>

					<p class="featured-desc">{project.shortDescription}</p>

					{#if project.stats.length > 0}
						<p class="featured-stats">
							{#each project.stats as stat, i (stat.label)}
								{#if i > 0}<span class="featured-stat-sep" aria-hidden="true">·</span>{/if}
								<span class="featured-stat">
									<span class="featured-stat-value" class:featured-stat-value--accent={stat.accent}>
										{stat.value}
									</span>
									{stat.label}
								</span>
							{/each}
						</p>
					{/if}

					{#if project.skills && project.skills.length > 0}
						<div class="chip-row featured-tech">
							{#each project.skills as skill (skill)}
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- skill filter URL -->
								<a class="chip chip--tech" href={skillHref(skill)}>{skill}</a>
							{/each}
						</div>
					{/if}

					<!-- eslint-disable svelte/no-navigation-without-resolve -- pre-resolved URL -->
					<a
						class="featured-action"
						href={project.finalLinkUrl}
						target={project.linkTarget}
						rel={project.linkTarget === '_blank' ? 'noopener noreferrer' : null}
					>
						{project.actionText}
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</article>
			{/each}
		</div>
	</section>
{/if}

<style>
	/* Section opens on a 3px rule with a mono "FEATURED" label. */
	.featured {
		border-top: var(--rule-section) solid var(--color-primary);
		padding-top: var(--space-sm);
		margin-bottom: var(--space-2xl);
	}

	.featured-head {
		margin-bottom: var(--space-lg);
	}

	.featured-label {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-emphasis);
	}

	/* Two projects per row, a hairline drawn between the columns. */
	.featured-grid {
		display: grid;
		grid-template-columns: 1fr;
		border-top: var(--rule-hairline) solid var(--color-border);
		padding-top: var(--space-lg);
	}

	.featured-cell {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		min-width: 0;
	}

	.featured-media {
		display: block;
		margin-bottom: var(--space-1);
	}

	.featured-plate {
		width: 100%;
		height: 220px;
		object-fit: cover;
	}

	.featured-eyebrow {
		margin: 0;
	}

	.featured-title {
		font-family: var(--font-family-display);
		font-variation-settings: var(--font-variation-display-sm);
		font-size: var(--font-size-2xl);
		font-weight: 780;
		letter-spacing: -0.01em;
		line-height: 1.08;
		margin: 0;
	}

	.featured-title a {
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.featured-title a:hover {
		color: var(--color-accent);
	}

	.featured-title a:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	.featured-desc {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
		margin: 0;
	}

	/* Stat row — the data voice, headline figure in the accent. */
	.featured-stats {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		margin: var(--space-1) 0 0;
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-medium);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.featured-stat-value {
		font-weight: var(--font-weight-bold);
		font-variant-numeric: tabular-nums;
		color: var(--color-text-emphasis);
	}

	.featured-stat-value--accent {
		color: var(--color-accent);
	}

	.featured-stat-sep {
		color: var(--color-text-faint);
	}

	.featured-tech {
		margin-top: var(--space-1);
		gap: var(--space-1-5);
	}

	/* Tech chip — a filter link (activates the skill filter), tighter than the
	 * catalogue filter chips. */
	.chip--tech {
		font-size: var(--font-size-2xs);
		letter-spacing: 0.08em;
		padding: var(--space-0-5) var(--space-1-5);
		color: var(--color-text-light);
		text-decoration: none;
	}

	.chip--tech:hover {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.featured-action {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-2xs);
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--color-accent);
		text-decoration: none;
		margin-top: var(--space-1);
	}

	.featured-action:hover {
		color: var(--color-accent-dark);
	}

	.featured-action:focus-visible {
		outline: var(--border-width-medium) solid var(--color-accent);
		outline-offset: var(--space-2xs);
	}

	/* Two-column layout with the hairline divider between cells. */
	@media (--md) {
		.featured-grid {
			grid-template-columns: 1fr 1fr;
		}

		.featured-cell:first-child {
			padding-right: var(--space-xl);
			border-right: var(--rule-hairline) solid var(--color-border);
		}

		.featured-cell:last-child {
			padding-left: var(--space-xl);
		}
	}
</style>
