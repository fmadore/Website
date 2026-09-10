<script lang="ts">
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import SEO from '$lib/SEO.svelte';
	import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
	import JsonLd from '$lib/components/common/JsonLd.svelte';
	import guestLectures from '$lib/data/teaching/guest-lectures';
	import type { GuestLecture } from '$lib/types';
	import {
		buildBreadcrumbJsonLd,
		createSubsectionBreadcrumbs
	} from '$lib/utils/breadcrumbJsonLd.svelte';

	// Define breadcrumb items
	const breadcrumbItems = createSubsectionBreadcrumbs(
		base,
		'Teaching',
		'/teaching',
		'Guest Lectures',
		'/teaching/guest-lectures'
	);

	const breadcrumbJsonLd = $derived(buildBreadcrumbJsonLd(breadcrumbItems));

	/**
	 * The lectures come from `$lib/data/teaching/guest-lectures`, the same
	 * record `/cv`, `/api/cv.json` and `/teaching` read. This page used to hold
	 * its own copy, and the copy had drifted: it printed eight rows against the
	 * dataset's nine (the January 2017 and February 2016 deliveries of one
	 * lecture were merged into a single date string) and dropped the country
	 * from every host institution, while the courses ledger one click away kept
	 * it. Grouping is derived, so a new record needs no edit here.
	 */
	const byInstitution = guestLectures.reduce<{ institution: string; lectures: GuestLecture[] }[]>(
		(acc, lecture) => {
			const group = acc.find((g) => g.institution === lecture.institution);
			if (group) group.lectures.push(lecture);
			else acc.push({ institution: lecture.institution, lectures: [lecture] });
			return acc;
		},
		[]
	);

	const years = guestLectures.map((lecture) => lecture.year).sort();
	const span = `${years[0]}–${years[years.length - 1]}`;
</script>

<SEO
	title="Guest lectures | Frédérick Madore"
	description="Guest lectures and invited talks on Islam, West Africa and historical research methods, delivered by Frédérick Madore in colleagues' undergraduate and graduate courses."
	keywords="guest lectures, invited talks, teaching, African history, Islam, West Africa, Frédérick Madore"
	pageType="CollectionPage"
/>

<JsonLd id="breadcrumb-json-ld-guest-lectures" json={breadcrumbJsonLd} />

<div class="container py-8">
	<Breadcrumb items={breadcrumbItems} />
	<PageHeader title="Guest lectures" />

	<PageIntro>
		Invited talks and lectures delivered in colleagues’ courses, listed by host institution and
		newest first.
	</PageIntro>

	<!-- The whole list, counted: the same figures /teaching prints in its index
	     of this page, read off the same dataset rather than restated. -->
	<p class="dateline lecture-tally">
		{guestLectures.length} lectures · {byInstitution.length} institutions · {span}
	</p>

	{#each byInstitution as group, i (group.institution)}
		<section class="section {i === 0 ? 'section--flush' : ''}">
			<div class="section-head">
				<h2 class="section-title">{group.institution}</h2>
				<span class="dateline">
					{group.lectures.length}
					{group.lectures.length === 1 ? 'lecture' : 'lectures'}
				</span>
			</div>

			<!-- Lectures as a ledger: date key + level status left, serif title +
			     host course right. The "In course" label is a field name — the
			     plainest database column on the page — so it takes the data voice
			     and leaves the course title itself in the document voice. -->
			<div class="ledger ledger--ruled" style="--ledger-key-w: 11rem">
				{#each group.lectures as lecture (lecture.title + lecture.date)}
					<div class="ledger-row">
						<span class="ledger-key">
							{lecture.date}
							<span class="ledger-status">{lecture.level}</span>
						</span>
						<span class="ledger-content">
							<span class="ledger-title">{typesetQuotes(lecture.title)}</span>
							<span class="lecture-course">
								<span class="dateline">In course</span>
								<em>{typesetQuotes(lecture.course)}</em>
							</span>
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

	/* No local narrow-measure collapse. `.lecture-row` used to redeclare it at
	 * `--md-down`, written before 1.3 moved the collapse onto `.ledger-row`
	 * itself at `--sm-down`; the copy made this page stack between 640 and
	 * 767px while every other ledger on the site did not.
	 *
	 * `.institution-section` is gone for the same reason: it added a 48px
	 * bottom margin to a `.section` that already sets 48px on top, so every
	 * gap between two institutions was doubled while the first was not. */
</style>
