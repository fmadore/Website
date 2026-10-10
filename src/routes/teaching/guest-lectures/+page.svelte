<script lang="ts">
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import SEO from '$lib/SEO.svelte';
	import { pageTitle } from '$lib/utils/siteHelpers';
	import { base, resolve } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import { groupLecturesByInstitution, lectureSpan } from '$lib/utils/teachingIndex';
	import { buildBreadcrumbJsonLd, createSubsectionBreadcrumbs } from '$lib/utils/breadcrumbJsonLd';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Define breadcrumb items
	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Teaching',
		'/teaching',
		'Guest Lectures and Workshops',
		'/teaching/guest-lectures'
	);

	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));

	/**
	 * The lectures come from the load: `$lib/data/teaching/guest-lectures` and
	 * the talks given as teaching, merged by `teachingLectures` — the same list
	 * `/cv`, `/api/cv.json` and `/teaching` read. This page used to hold
	 * its own copy, and the copy had drifted: it printed eight rows against the
	 * dataset's nine (the January 2017 and February 2016 deliveries of one
	 * lecture were merged into a single date string) and dropped the country
	 * from every host institution, while the courses ledger one click away kept
	 * it. Grouping is derived (`$lib/utils/teachingIndex`, shared with the
	 * page's Markdown twin), so a new record needs no edit here.
	 */
	const byInstitution = $derived(groupLecturesByInstitution(data.lectures));

	// Empty when there is nothing on record, rather than "undefined–undefined".
	const span = $derived(lectureSpan(data.lectures));
</script>

<SEO
	title={pageTitle('Guest lectures and workshops')}
	description="Guest lectures, seminar lectures and training workshops on Islam, West Africa and research methods, given by Frédérick Madore in colleagues' courses, seminars and training programmes."
	keywords="guest lectures, seminars, workshops, teaching, African history, Islam, West Africa, Frédérick Madore"
	pageType="CollectionPage"
/>

<JsonLd id="breadcrumb-json-ld-guest-lectures" json={breadcrumbJsonLd} />

<div class="container py-8">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Guest lectures and workshops" />

	<PageIntro>
		Lectures and workshops given in colleagues’ courses, seminars and training programmes, listed by
		host institution and newest first.
	</PageIntro>

	<!-- The whole list, counted: the same figures /teaching prints in its index
	     of this page, read off the same rows rather than restated. With
	     nothing on record there is no tally to print, so the page states that
	     instead. -->
	{#if data.lectures.length === 0}
		<p class="dateline lecture-tally">No lectures or workshops on record.</p>
	{:else}
		<p class="dateline lecture-tally">
			{data.lectures.length}
			{data.lectures.length === 1 ? 'entry' : 'entries'} · {byInstitution.length}
			{byInstitution.length === 1 ? 'institution' : 'institutions'} · {span}
		</p>
	{/if}

	{#each byInstitution as group, i (group.institution)}
		<section class="section {i === 0 ? 'section--flush' : ''}">
			<div class="section-head">
				<h2 class="section-title">{group.institution}</h2>
				<span class="dateline">
					{group.lectures.length}
					{group.lectures.length === 1 ? 'entry' : 'entries'}
				</span>
			</div>

			<!-- Lectures as a ledger: date key + level status left, serif title +
			     host course, seminar or programme right. The "In" label is a field
			     name — the plainest database column on the page — so it takes the
			     data voice and leaves the course title itself in the document
			     voice. A talk given as teaching has its own page; the row links
			     to it, named for the lecture since several rows carry the stamp. -->
			<div class="ledger ledger--ruled" style="--ledger-key-w: 11rem">
				{#each group.lectures as lecture (lecture.title + lecture.date)}
					<div class="ledger-row">
						<span class="ledger-key">
							{lecture.date}
							{#if lecture.level}
								<span class="ledger-status">{lecture.level}</span>
							{/if}
						</span>
						<span class="ledger-content">
							<span class="ledger-title">{typesetQuotes(lecture.title)}</span>
							<span class="lecture-course">
								<span class="dateline">In</span>
								<em>{typesetQuotes(lecture.course)}</em>
							</span>
							{#if lecture.talkId}
								<a
									class="ledger-action lecture-talk"
									href={resolve('/communications/[id]', { id: lecture.talkId })}
									aria-label={`View talk: ${lecture.title}`}
								>
									View talk <span aria-hidden="true">→</span>
								</a>
							{/if}
						</span>
					</div>
				{/each}
			</div>
		</section>
	{/each}
</div>

<style>
	/* The page tally, set once under the standfirst. `.section` already carries
	 * the 48px that separates one institution from the next, so the tally only
	 * closes the gap between itself and the first rule. */
	.lecture-tally {
		margin: 0 0 var(--space-xl);
	}

	/* Course line — serif prose, title of the host course set in italic, with
	 * the field label in the data voice ahead of it. */
	.lecture-course {
		font-family: var(--font-family-serif);
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
	}

	.lecture-course em {
		font-style: italic;
		color: var(--color-text-emphasis);
	}

	/* The stamp keeps its own width in the content column, which stretches its
	 * children by default. */
	.lecture-talk {
		align-self: flex-start;
	}

	/* No local narrow-measure collapse. `.lecture-row` used to redeclare it at
	 * `--md-down`, written before 1.3 moved the collapse onto `.ledger-row`
	 * itself at `--sm-down`; the copy made this page stack between 640 and
	 * 767px while every other ledger on the site did not.
	 *
	 * `.institution-section` is gone for the same reason: it added a 48px
	 * bottom margin to a `.section` that already sets 48px on top, so every
	 * gap between two institutions was doubled while the first was not. */
</style>
