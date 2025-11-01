<script lang="ts">
	import teaching from '$lib/data/teaching';
	import guestLectures from '$lib/data/teaching/guest-lectures';
	import { base } from '$app/paths';

	// Format year range for display (e.g., "2013-18" or "2020")
	function formatYearRange(yearString: string): string {
		if (!yearString.includes('-')) {
			return yearString;
		}
		const [startYear, endYear] = yearString.split('-').map((y) => parseInt(y));
		// Compact format: use last 2 digits of end year if in same century
		const startCentury = Math.floor(startYear / 100);
		const endCentury = Math.floor(endYear / 100);
		if (startCentury === endCentury) {
			return `${startYear}-${endYear.toString().slice(-2)}`;
		}
		return `${startYear}-${endYear}`;
	}

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
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Teaching Experience</h3>
	{#if sortedTeaching.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Instructor</h4>
		<div class="space-y-3">
			{#each sortedTeaching as course}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap w-20">{formatYearRange(course.year)}</div>
					<div class="flex-1">
						<strong>{course.title}</strong>, {course.institution}, {course.level === 'undergraduate'
							? 'Undergraduate'
							: 'Graduate'}
						{#if course.sections}
							({course.sections})
						{/if}
						{#if course.period}
							({course.period})
						{/if}.
					</div>
				</div>
			{/each}
		</div>

		<h4 class="text-lg font-semibold mt-4 mb-2">Guest Lecturer</h4>
		<div class="space-y-3">
			{#each sortedGuestLectures as lecture}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{lecture.year}</div>
					<div class="flex-1">
						<strong>{lecture.title}</strong>, <em>{lecture.course}</em>, {lecture.institution}, {lecture.level ===
						'undergraduate'
							? 'Undergraduate'
							: 'Graduate'}.
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-light">No teaching experience listed.</p>
	{/if}
</section>
