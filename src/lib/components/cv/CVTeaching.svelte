<script lang="ts">
	import teaching from '$lib/data/teaching';
	import guestLectures from '$lib/data/teaching/guest-lectures';
	import { cvCommunicationsByDate } from '$lib/data/communications/cv';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import {
		lectureHostAndLevel,
		sortCoursesByYear,
		splitCvTalks,
		teachingLectures,
		teachingLevelLabel
	} from '$lib/utils/cvSections';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

	// Newest first, on copies: the imported arrays are the shared datasets every
	// other page reads. The CV's Markdown twin orders them the same way.
	const sortedTeaching = sortCoursesByYear(teaching);
	// The guest lectures and the talks given as teaching, which Invited Talks
	// leaves out so that each is printed once.
	const lectures = teachingLectures(guestLectures, splitCvTalks(cvCommunicationsByDate).teaching);
</script>

<section>
	<h3>Teaching Experience</h3>
	{#if sortedTeaching.length > 0}
		<h4>Instructor</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each sortedTeaching as course (course.title + course.year)}
				<CVEntry year={formatCVYearRange(course.year)}>
					<strong>{typesetQuotes(course.title)}</strong>, {typesetQuotes(course.institution)}, {teachingLevelLabel(
						course.level
					)}
					{#if course.sections}
						({course.sections})
					{/if}
					{#if course.period}
						({course.period})
					{/if}.
				</CVEntry>
			{/each}
		</div>

		<h4>Guest Lectures and Workshops</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each lectures as lecture (lecture.title + lecture.dateISO)}
				<CVEntry year={lecture.year}>
					<strong>{typesetQuotes(lecture.title)}</strong>, <em>{typesetQuotes(lecture.course)}</em>,
					{typesetQuotes(lectureHostAndLevel(lecture))}.
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No teaching experience listed.</p>
	{/if}
</section>
