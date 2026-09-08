<!--
ActivityItem — one entry of the activities log.

Renders through <BibliographyRow>, the finding-aid ledger entry that
/publications and /conference-activity already share, so the third index page in
the family draws the same row rather than a third attempt at it. It previously
carried its own grid (`.activity-row-link`), which meant three sibling pages,
two idioms — and the local copy dropped the plate track on rows without a
photograph, so titles stepped left and right down the list.

Two differences from its siblings, both of them the record's own:

  - the hanging key is a day + month stamp, not a year. An activity is dated to
    the day and the log is read in date order, so the key carries the granularity
    the record actually has;
  - the row prints its description as a summary and its tags as an apparatus run
    (`summary` / `apparatus`), which is the prose and the apparatus a log entry
    carries where a bibliographic row carries a byline.
-->
<script lang="ts">
	import type { Activity } from '$lib/stores/activities.svelte';
	import { resolve } from '$app/paths';
	import BibliographyRow, {
		type BibliographyAction
	} from '$lib/components/molecules/BibliographyRow.svelte';
	import { ACTIVITY_TYPE_BADGE_LABELS } from '$lib/utils/typeUtils';
	import { formatShortDateMono } from '$lib/utils/date-formatter';

	// `headingLevel` follows the page, not the component: the index heads each
	// year group with a real <h2>, so an entry there is an <h3>; the year archive
	// is one year already and heads nothing, so an entry sits directly under the
	// page <h1> and must not skip a level.
	let {
		activity,
		eager = false,
		headingLevel = 3
	}: { activity: Activity; eager?: boolean; headingLevel?: 2 | 3 } = $props();

	let activityLink = $derived(resolve('/activities/[id]', { id: activity.id }));

	// Record kind for the eyebrow. Read from the shared label map rather than a
	// local copy: the log used to keep its own, which named `grant` "Grant" while
	// the type facet directly beside it named the same records "Research Grant",
	// and had no entry at all for `career`, `news` or `presentation`.
	const kindLabel = $derived(
		activity.type ? (ACTIVITY_TYPE_BADGE_LABELS[activity.type] ?? activity.type) : 'Activity'
	);

	// Day + month stamp for the hanging key (e.g. "29 JUN"). The mono key wants
	// the compact machine form, not the long display date, and the year is
	// already carried by the year-group head above the row — so the shared
	// dateline formatter is trimmed of it rather than a second month table being
	// written here. `formatShortDateMono` returns '' on a missing or malformed
	// ISO date, in which case the record's own display date stands in.
	const dayMonth = $derived(
		formatShortDateMono(activity.dateISO).replace(/\s\d{4}$/, '') || activity.date
	);

	// The plate: prefer the hero image, fall back to the small image.
	const plateSrc = $derived(activity.heroImage?.src || activity.image || null);
	const plateAlt = $derived(activity.heroImage?.alt || `Illustration — ${activity.title}`);

	// Where the record goes, if it goes anywhere. Facts belong in the kind
	// eyebrow and destinations in the action column (the rule 2.2 settled on the
	// bibliography row): the log used to print no external address at all, so an
	// episode or a published piece could only be reached through its record page.
	const actions = $derived.by((): BibliographyAction[] => {
		if (!activity.url) return [];
		const label = activity.urlLabel ?? (activity.type === 'publication' ? 'Read' : 'Visit');
		return [{ href: activity.url, label: `${label} ↗`, primary: true }];
	});

	// Tag run — uppercase mono, interpunct-separated, capped with "+N" overflow.
	const MAX_TAGS = 4;
	const tagRun = $derived.by(() => {
		const tags = activity.tags ?? [];
		if (tags.length === 0) return '';
		const shown = tags.slice(0, MAX_TAGS).join(' · ');
		const extra = tags.length - MAX_TAGS;
		return extra > 0 ? `${shown} · +${extra}` : shown;
	});
</script>

<!-- Landscape plate: an event photograph or a book cover shot in the field, not
     the portrait covers /publications hangs or the square seals talks carry.
     The log widens the shelf to 120px (`--bib-cover-w` on `.log-list`) so a
     3:2 frame still reads, and `plateSizes` restates that width — the shared
     default describes the 80px shelf and would fetch a candidate a third too
     narrow for the box it renders. -->
<BibliographyRow
	href={activityLink}
	{kindLabel}
	title={activity.title}
	summary={activity.description}
	apparatus={tagRun}
	image={plateSrc}
	imageAlt={plateAlt}
	imageWidth={300}
	imageHeight={200}
	plateAspect="3 / 2"
	plateSizes="(max-width: 640px) 56px, 120px"
	loading={eager ? 'eager' : 'lazy'}
	{actions}
	yearLabel={dayMonth}
	{headingLevel}
/>
