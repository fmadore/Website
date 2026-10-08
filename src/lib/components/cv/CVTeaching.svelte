<script lang="ts">
	import teaching from '$lib/data/teaching';
	import guestLectures from '$lib/data/teaching/guest-lectures';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import {
		sortCoursesByYear,
		sortGuestLecturesByYear,
		teachingLevelLabel
	} from '$lib/utils/cvSections';
	import { typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

	// Newest first, on copies: the imported arrays are the shared datasets every
	// other page reads. The CV's Markdown twin orders them the same way.
	const sortedTeaching = sortCoursesByYear(teaching);
	const sortedGuestLectures = sortGuestLecturesByYear(guestLectures);
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

		<h4>Guest Lecturer</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each sortedGuestLectures as lecture (lecture.title + lecture.year)}
				<CVEntry year={lecture.year}>
					<strong>{typesetQuotes(lecture.title)}</strong>, <em>{typesetQuotes(lecture.course)}</em>,
					{typesetQuotes(lecture.institution)}, {teachingLevelLabel(lecture.level)}.
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="cv-empty">No teaching experience listed.</p>
	{/if}
</section>
