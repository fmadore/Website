<script lang="ts">
	import teaching from '$lib/data/teaching';
	import guestLectures from '$lib/data/teaching/guest-lectures';
	import { formatCVYearRange } from '$lib/utils/cvFormatters';
	import CVEntry from './CVEntry.svelte';

	// Sort teaching by year (most recent first)
	const sortedTeaching = teaching.sort((a, b) => {
		const yearA = parseInt(a.year.split('-')[0]);
		const yearB = parseInt(b.year.split('-')[0]);
		return yearB - yearA;
	});

	// Sort guest lectures by year (most recent first)
	const sortedGuestLectures = guestLectures.sort((a, b) => {
		const yearA = parseInt(a.year);
		const yearB = parseInt(b.year);
		return yearB - yearA;
	});
</script>

<section>
	<h3>Teaching Experience</h3>
	{#if sortedTeaching.length > 0}
		<h4>Instructor</h4>
		<div class="space-y-3">
			{#each sortedTeaching as course}
				<CVEntry year={formatCVYearRange(course.year)} yearWidth="fixed">
					<strong>{course.title}</strong>, {course.institution}, {course.level === 'undergraduate'
						? 'Undergraduate'
						: 'Graduate'}
					{#if course.sections}
						({course.sections})
					{/if}
					{#if course.period}
						({course.period})
					{/if}.
				</CVEntry>
			{/each}
		</div>

		<h4 class="text-lg font-semibold mt-4 mb-2">Guest Lecturer</h4>
		<div class="space-y-3">
			{#each sortedGuestLectures as lecture}
				<CVEntry year={lecture.year}>
					<strong>{lecture.title}</strong>, <em>{lecture.course}</em>, {lecture.institution}, {lecture.level ===
					'undergraduate'
						? 'Undergraduate'
						: 'Graduate'}.
				</CVEntry>
			{/each}
		</div>
	{:else}
		<p class="text-light">No teaching experience listed.</p>
	{/if}
</section>
