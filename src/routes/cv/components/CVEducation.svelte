<script lang="ts">
	import { educationByDate } from '$lib/data/education';

	// Filter education items by type
	const degrees = educationByDate.filter((edu) => edu.type === 'Degree');
	const trainings = educationByDate.filter((edu) => edu.type === 'Training');
	const certificates = educationByDate.filter((edu) => edu.type === 'Certificate');
	const otherEducation = educationByDate.filter(
		(edu) => !['Degree', 'Training', 'Certificate'].includes(edu.type || '')
	);
</script>

<section>
	<h3 class="text-2xl font-semibold mb-2 border-b border-default pb-1">Education</h3>

	{#if degrees.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Degrees</h4>
		<div class="space-y-3">
			{#each degrees as edu (edu.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{edu.year}</div>
					<div class="flex-1">
						{edu.degree}.
						{edu.institution}{#if edu.location}, {edu.location}{/if}.
						{#if edu.thesisTitle}
							<p class="text-sm mt-1">Dissertation: "{edu.thesisTitle}"</p>{/if}
						{#if edu.details}
							<p class="text-sm mt-1">{edu.details}</p>{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if trainings.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Digital Humanities Trainings</h4>
		<div class="space-y-3">
			{#each trainings as edu (edu.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{edu.year}</div>
					<div class="flex-1">
						"{edu.degree}".
						{edu.institution}{#if edu.location}, {edu.location}{/if}{#if edu.details}, {edu.details}{/if}.
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if certificates.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Certificates</h4>
		<div class="space-y-3">
			{#each certificates as edu (edu.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{edu.year}</div>
					<div class="flex-1">
						{edu.degree}.
						{edu.institution}{#if edu.location}, {edu.location}{/if}{#if edu.details}, {edu.details}{/if}.
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if otherEducation.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Other Education</h4>
		<div class="space-y-3">
			{#each otherEducation as edu (edu.id)}
				<div class="flex gap-4">
					<div class="font-semibold text-nowrap">{edu.year}</div>
					<div class="flex-1">
						{edu.degree}.
						{edu.institution}{#if edu.location}, {edu.location}{/if}.
						{#if edu.details}
							<p class="text-sm mt-1">{edu.details}</p>{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if educationByDate.length === 0}
		<p class="text-light">No educational qualifications listed.</p>
	{/if}
</section>
