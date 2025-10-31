<script lang="ts">
	import teaching from '$lib/data/teaching';
	import { base } from '$app/paths';

	// Sort teaching by year (most recent first)
	const sortedTeaching = teaching.sort((a, b) => {
		const yearA = parseInt(a.year.split('-')[0]);
		const yearB = parseInt(b.year.split('-')[0]);
		return yearB - yearA;
	});
</script>

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-2 border-b border-light pb-1">Teaching Experience</h3>
	{#if sortedTeaching.length > 0}
		<div class="space-y-3">
			{#each sortedTeaching as course}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{course.year}</div>
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
	{:else}
		<p class="text-light">No teaching experience listed.</p>
	{/if}
</section>
