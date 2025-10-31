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

<section class="mb-8">
	<h3 class="text-2xl font-semibold mb-4 border-b border-light pb-1">Education</h3>

	{#if degrees.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Degrees</h4>
		<ul>
			{#each degrees as edu (edu.id)}
				<li class="mb-3 ml-4">
					<span class="font-medium">{edu.degree}</span> ({edu.year}).
					<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
					{#if edu.thesisTitle}
						<p class="ml-4 text-sm">Thesis: "{edu.thesisTitle}"</p>{/if}
					{#if edu.details}
						<p class="ml-4 text-sm">{edu.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if trainings.length > 0}
		<h4 class="text-lg font-semibold mt-4 mb-2">Digital Humanities Trainings</h4>
		<div class="space-y-3">
			{#each trainings as edu (edu.id)}
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
		<ul>
			{#each otherEducation as edu (edu.id)}
				<li class="mb-3 ml-4">
					<span class="font-medium">{edu.degree}</span> ({edu.year}).
					<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
					{#if edu.details}
						<p class="ml-4 text-sm">{edu.details}</p>{/if}
				</li>
			{/each}
		</ul>
	{/if}

	{#if educationByDate.length === 0}
		<p class="text-light">No educational qualifications listed.</p>
	{/if}
</section>
