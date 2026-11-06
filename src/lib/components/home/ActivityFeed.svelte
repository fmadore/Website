<script lang="ts">
	import { resolve } from '$app/paths';
	import { typesetQuotes } from '#lib/utils/typesetQuotes.ts';
	import { formatDayMonth, yearOf } from '#lib/utils/homeDigest.ts';
	import type { ActivityLog } from '#lib/utils/activityLog.ts';

	/**
	 * The newest entries in the activity log, set across the page as dated
	 * columns. The newest entry's dateline is the current thing, so it alone
	 * takes the accent.
	 */
	let { log }: { log: ActivityLog } = $props();
</script>

<section class="section activity-feed" aria-labelledby="activity-feed-title">
	<div class="feed-head">
		<h2 class="section-title" id="activity-feed-title">Latest activities</h2>
		<a class="mono-action" href={resolve('/activities')}>
			View all activities <span aria-hidden="true">→</span>
		</a>
	</div>

	{#if log.latest.length === 0}
		<p class="state-note">The log is empty.</p>
	{:else}
		<ol class="feed-list">
			{#each log.latest as activity, i (activity.id)}
				<li>
					<a class="feed-item" href={resolve('/activities/[id]', { id: activity.id })}>
						<span class="feed-date" class:feed-date--current={i === 0}>
							<time datetime={activity.dateISO}
								>{formatDayMonth(activity.dateISO)} {yearOf(activity.dateISO)}</time
							>
						</span>
						<span class="feed-title">{typesetQuotes(activity.title)}</span>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.feed-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-xs) var(--space-md);
		margin-bottom: var(--space-md);
	}

	.feed-list {
		display: grid;
		grid-template-columns: 1fr;
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.feed-list li + li {
		border-top: var(--rule-hairline) solid var(--color-hairline);
	}

	.feed-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		padding: var(--space-sm) 0;
		color: var(--color-text-emphasis);
		text-decoration: none;
	}

	.feed-item:focus-visible {
		outline: var(--focus-outline);
		outline-offset: var(--focus-outline-inset);
	}

	.feed-date {
		font-family: var(--font-family-mono);
		font-size: var(--font-size-xs);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		color: var(--color-text-light);
	}

	.feed-date--current {
		color: var(--color-accent);
	}

	.feed-title {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		line-height: var(--line-height-snug);
		text-decoration: underline;
		text-decoration-color: transparent;
		text-underline-offset: 0.2em;
		transition: text-decoration-color 150ms ease;
	}

	.feed-item:hover .feed-title {
		text-decoration-color: var(--color-accent);
	}

	/* From --md the entries stand side by side, hairline-ruled columns. */
	@media (--md) {
		.feed-list {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}

		.feed-list li + li {
			border-top: 0;
			border-left: var(--rule-hairline) solid var(--color-hairline);
		}

		.feed-list li {
			padding-inline: var(--space-md);
		}

		.feed-list li:first-child {
			padding-left: 0;
		}

		.feed-list li:last-child {
			padding-right: 0;
		}
	}

	@media (--reduced-motion) {
		.feed-title {
			transition: none;
		}
	}
</style>
