<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import { createSectionBreadcrumbs } from '$lib/utils/seoUtils';
	import { base, resolve } from '$app/paths'; // base for files, resolve for hrefs
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import PageIntro from '$lib/components/common/PageIntro.svelte';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import teaching from '$lib/data/teaching';
	import guestLectures from '$lib/data/teaching/guest-lectures';

	// Breadcrumbs for this section
	const breadcrumbs = createSectionBreadcrumbs('Teaching', '/teaching');

	/**
	 * The courses come from `$lib/data/teaching`, which is also what `/cv` and
	 * `/api/cv.json` read. This page used to hold its own copy of the same four
	 * records, and the two had drifted: the guest-lecture list printed eight
	 * entries against the dataset's nine, named the host institutions without
	 * their countries, and lower-cased the terms. One record, one place.
	 *
	 * Sorted newest-first on the same key `CVTeaching` uses, over a copy —
	 * the exported array is shared module state.
	 */
	const courses = [...teaching].sort((a, b) => {
		const yearA = parseInt(a.year.split('-')[0] ?? a.year, 10);
		const yearB = parseInt(b.year.split('-')[0] ?? b.year, 10);
		return yearB - yearA;
	});

	/**
	 * The one fact the ledger keys make you scan for. A count of institutions
	 * would only restate what three visible rows already say; the reach of the
	 * record does not survive a glance, so that is what the dateline carries —
	 * and it makes the two section datelines parallel, count then span.
	 */
	const courseYears = courses.flatMap((course) => course.year.split('-')).sort();
	// An empty dataset has no first and no last year, and printing the span
	// anyway is how a page ends up advertising “undefined–undefined”.
	const courseSpan =
		courseYears.length > 0 ? `${courseYears[0]}–${courseYears[courseYears.length - 1]}` : '';

	/**
	 * Guest lectures are indexed here by host institution rather than listed:
	 * the full list is its own page, and what this page owes the reader is the
	 * shape of it — who hosted, over which years, how many times. Every figure
	 * is counted off the dataset, so the index cannot drift from the list.
	 */
	const hosts = guestLectures.reduce<
		{ institution: string; count: number; from: string; to: string }[]
	>((acc, lecture) => {
		const host = acc.find((h) => h.institution === lecture.institution);
		if (host) {
			host.count += 1;
			host.from = lecture.year < host.from ? lecture.year : host.from;
			host.to = lecture.year > host.to ? lecture.year : host.to;
		} else {
			acc.push({
				institution: lecture.institution,
				count: 1,
				from: lecture.year,
				to: lecture.year
			});
		}
		return acc;
	}, []);

	const lectureYears = guestLectures.map((lecture) => lecture.year).sort();
	const lectureSpan =
		lectureYears.length > 0 ? `${lectureYears[0]}–${lectureYears[lectureYears.length - 1]}` : '';

	const guestLecturesHref = resolve('/teaching/guest-lectures');
</script>

<SEO
	title="Teaching | Frédérick Madore"
	description="Teaching experience by Frédérick Madore, including courses on African History, Islam in sub-Saharan Africa, and digital humanities."
	keywords="teaching, courses, African history, Islam, digital humanities, Frédérick Madore, guest lectures"
	canonical="https://www.frederickmadore.com/teaching"
	{breadcrumbs}
	pageType="CollectionPage"
/>

<div class="container py-8">
	<div class="max-w-6xl mx-auto">
		<!-- The section masthead, on the index tier: /teaching is a sibling of
		     /research and /publications and opens on the same rule and the same
		     display size. The eyebrow states what the page holds, counted off
		     the dataset the ledger below renders.

		     No data ornament beside the standfirst, unlike /research: a course
		     list of this size has no honest distribution to draw, and inventing
		     one is exactly the decoration the brief forbids. The empty half of
		     the hero closes instead — `.page-intro` already caps the standfirst
		     at `--measure-standfirst`, so the measure is the module's width. -->
		<PageHeader
			tier="index"
			title="Teaching"
			typeBadgeText="Courses"
			date="{courses.length} entries"
		/>

		<PageIntro>
			Teaching interests: African History (pre-modern and modern periods), Islam in sub-Saharan
			Africa, Digital Humanities, West African history.
		</PageIntro>

		<!-- COURSES — a pure ledger: term key + level status left, serif title,
		     institution and description right, mono syllabus action in the meta
		     column. The section opens on the 3px rule, which is the page's own
		     hierarchy: two modules under the masthead, courses then lectures. -->
		<section class="section section--flush">
			<div class="section-head">
				<h2 class="section-title">Courses taught</h2>
				{#if courses.length > 0}
					<span class="dateline"
						>{courses.length}
						{courses.length === 1 ? 'entry' : 'entries'} · {courseSpan}</span
					>
				{/if}
			</div>

			{#if courses.length === 0}
				<p class="dateline teaching-empty">No courses on record.</p>
			{:else}
				<div class="ledger ledger--ruled course-ledger">
					{#each courses as course (course.id)}
						<div class="ledger-row ledger-row--meta">
							<span class="ledger-key">
								{course.period ?? course.year}
								<span class="ledger-status"
									>{course.level}{#if course.sections}
										· {course.sections}{/if}</span
								>
							</span>

							<span class="ledger-content">
								<span class="ledger-title">{typesetQuotes(course.title)}</span>
								<span class="course-institution">{course.institution}</span>
								{#if course.description}
									<span class="ledger-desc">{course.description}</span>
								{/if}
							</span>

							<span class="ledger-meta">
								{#if course.syllabusUrl}
									<!-- eslint-disable svelte/no-navigation-without-resolve -- base-prefixed static asset -->
									<!-- Named for the record it belongs to: two rows carry the same
								     visible stamp, and a link list that reads "Syllabus PDF"
								     twice names neither course. The visible label leads the
								     accessible name, so speech input still matches it. -->
									<a
										class="ledger-action"
										href={`${base}${course.syllabusUrl}`}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Syllabus PDF: ${course.title} (opens in new tab)`}
									>
										Syllabus PDF<span aria-hidden="true">&nbsp;↗</span>
									</a>
									<!-- eslint-enable svelte/no-navigation-without-resolve -->
								{/if}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- GUEST LECTURES — the second view of the same section. Indexed by host
		     rather than listed: years, institution and count are all counted off
		     the dataset the full list renders, so the two cannot disagree. -->
		<section class="section">
			<div class="section-head">
				<h2 class="section-title">Guest lectures</h2>
				{#if guestLectures.length > 0}
					<span class="dateline"
						>{guestLectures.length}
						{guestLectures.length === 1 ? 'lecture' : 'lectures'} · {lectureSpan}</span
					>
				{/if}
			</div>

			<p class="section-note">
				Invited talks in colleagues’ courses, indexed here by host institution.
			</p>

			{#if hosts.length === 0}
				<p class="dateline teaching-empty">No guest lectures on record.</p>
			{:else}
				<div class="ledger ledger--ruled host-ledger">
					{#each hosts as host (host.institution)}
						<div class="ledger-row ledger-row--meta">
							<span class="ledger-key">
								{host.from === host.to ? host.from : `${host.from}–${host.to}`}
							</span>
							<span class="ledger-content">
								<span class="ledger-title">{host.institution}</span>
							</span>
							<span class="ledger-meta">
								{host.count}
								{host.count === 1 ? 'lecture' : 'lectures'}
							</span>
						</div>
					{/each}
				</div>

				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- pre-resolved URL -->
				<a class="ledger-action ledger-action--standalone" href={guestLecturesHref}>
					All {guestLectures.length} guest lectures <span aria-hidden="true">→</span>
				</a>
			{/if}
		</section>
	</div>
</div>

<style>
	/* Per-instance ledger tuning, in CSS rather than inline so the mid-band
	 * rule below can win: an inline custom property beats every selector.
	 * The key holds a full academic term ("Fall 2013 – Winter 2018") and the
	 * meta column one action stamp. */
	.course-ledger {
		--ledger-key-w: 13rem;
		--ledger-meta-w: 9rem;
	}

	.host-ledger {
		--ledger-meta-w: 8rem;
	}

	/* Between the ledger's own stacking point (640px) and --md, three tracks
	 * share ~600px. The fixed ones give the record back its room; the key
	 * wraps to two lines there, which is what a hanging key does. */
	@media (--md-down) {
		.course-ledger {
			--ledger-key-w: 8.5rem;
			--ledger-meta-w: 7rem;
		}
	}

	/* Empty section — the state named where the ledger would have been, on the
	 * same interval the first ledger row takes under the section rule. */
	.teaching-empty {
		margin: var(--space-md) 0 0;
	}

	/* Institution — serif byline under the course title. */
	.course-institution {
		font-family: var(--font-family-serif);
		font-style: italic;
		font-size: var(--font-size-base);
		color: var(--color-text-soft);
	}

	/* `.section-note` is not declared here. It began as a local class on this
	 * page and is now the idiom in `ink-signal.css`: a serif line between a
	 * section head and its records is general, and `VizSection` had already
	 * written the same rule under a second name.
	 *
	 * The narrow-measure collapse is NOT redeclared here either. `.course-row` used to
	 * carry its own copy at `--md-down`, written before 1.3 moved the collapse
	 * onto `.ledger-row` itself at `--sm-down` — so this page stacked between
	 * 640 and 767px while every other ledger on the site did not. The idiom
	 * owns it; the page inherits it. */
</style>
