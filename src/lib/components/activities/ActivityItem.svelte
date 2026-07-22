<script lang="ts">
	import type { Activity } from '$lib/stores/activities.svelte';
	import { base, resolve } from '$app/paths';

	let { activity, eager = false }: { activity: Activity; eager?: boolean } = $props();

	let activityLink = $derived(resolve('/activities/[id]', { id: activity.id }));

	// Record kind for the dateline stamp (TALK / CONFERENCE / WORKSHOP / GRANT …).
	const kindLabels: Record<string, string> = {
		conference: 'Conference',
		workshop: 'Workshop',
		seminar: 'Seminar',
		lecture: 'Lecture',
		talk: 'Talk',
		event: 'Event',
		panel: 'Panel',
		publication: 'Publication',
		grant: 'Grant',
		podcast: 'Podcast',
		review: 'Review',
		roundtable: 'Roundtable'
	};
	const kind = $derived(activity.type ?? activity.panelType ?? '');
	const kindLabel = $derived(kind ? (kindLabels[kind.toLowerCase()] ?? kind) : '');

	// Day + month stamp from the ISO date (e.g. "29 JUN"). The mono dateline
	// wants the compact machine form, not the long display date.
	const MONTHS = [
		'JAN',
		'FEB',
		'MAR',
		'APR',
		'MAY',
		'JUN',
		'JUL',
		'AUG',
		'SEP',
		'OCT',
		'NOV',
		'DEC'
	];
	const dayMonth = $derived.by(() => {
		const iso = activity.dateISO;
		if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
			const [, m, d] = iso.split('-');
			const month = MONTHS[parseInt(m, 10) - 1] ?? '';
			return `${parseInt(d, 10)} ${month}`;
		}
		// Fall back to the raw display date if the ISO form is missing/odd.
		return activity.date;
	});

	// The plate thumbnail: prefer the hero image, fall back to the small image.
	const thumbSrc = $derived(activity.heroImage?.src || activity.image || '');
	const thumbAlt = $derived(activity.heroImage?.alt || activity.title);
	const hasPhoto = $derived(Boolean(thumbSrc));

	// Tag run — uppercase mono, dot-separated, capped with "+N" overflow.
	const MAX_TAGS = 4;
	const tagRun = $derived.by(() => {
		const tags = activity.tags ?? [];
		if (tags.length === 0) return '';
		const shown = tags.slice(0, MAX_TAGS).join(' · ');
		const extra = tags.length - MAX_TAGS;
		return extra > 0 ? `${shown} · +${extra}` : shown;
	});
</script>

<!-- A dated press-column entry: mono date/kind column, an optional image plate,
     then serif title + summary + a mono tag run. The whole row is the
     affordance — hovering warms the title to the accent (activity-list.css). -->
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved via resolve() -->
<a
	href={activityLink}
	class="activity-row-link"
	class:has-photo={hasPhoto}
	data-sveltekit-preload-code="tap"
>
	<div class="activity-dateline">
		<span class="activity-day">{dayMonth}</span>
		{#if kindLabel}
			<span class="activity-kind">{kindLabel}</span>
		{/if}
	</div>

	{#if hasPhoto}
		<div class="activity-plate-wrap">
			<!-- The first row's plate is usually the page's LCP element, so the
			     caller marks it eager + high priority; the rest stay lazy. -->
			<img
				class="plate activity-plate"
				src="{base}/{thumbSrc}"
				alt={thumbAlt}
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : undefined}
			/>
		</div>
	{/if}

	<div class="activity-body">
		<h3 class="activity-title">{activity.title}</h3>
		{#if activity.description}
			<p class="activity-summary">{activity.description}</p>
		{/if}
		{#if tagRun}
			<p class="activity-tagrun">{tagRun}</p>
		{/if}
	</div>
</a>
