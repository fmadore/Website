<script lang="ts">
	import { educationByDate } from '$lib/data/education';
	import CVEntry from './CVEntry.svelte';

	// Filter education items by type
	const degrees = educationByDate.filter((edu) => edu.type === 'Degree');
	const trainings = educationByDate.filter((edu) => edu.type === 'Training');
	const certificates = educationByDate.filter((edu) => edu.type === 'Certificate');
	const otherEducation = educationByDate.filter(
		(edu) => !['Degree', 'Training', 'Certificate'].includes(edu.type || '')
	);
</script>

<section>
	<h3>Education</h3>

	{#if degrees.length > 0}
		<h4>Degrees</h4>
		<div class="space-y-3 ledger">
			{#each degrees as edu (edu.id)}
				<CVEntry year={edu.year}>
					{edu.degree}.
					{edu.institution}{#if edu.location}, {edu.location}{/if}.
					{#if edu.thesisTitle}
						<p class="text-sm mt-1">Dissertation: "{edu.thesisTitle}"</p>{/if}
					{#if edu.details}
						<p class="text-sm mt-1">{edu.details}</p>{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if trainings.length > 0}
		<h4>Digital Humanities Trainings</h4>
		<div class="space-y-3 ledger">
			{#each trainings as edu (edu.id)}
				<CVEntry year={edu.year}>
					"{edu.degree}".
					{edu.institution}{#if edu.location}, {edu.location}{/if}{#if edu.details}, {edu.details}{/if}.
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if certificates.length > 0}
		<h4>Certificates</h4>
		<div class="space-y-3 ledger">
			{#each certificates as edu (edu.id)}
				<CVEntry year={edu.year}>
					{edu.degree}.
					{edu.institution}{#if edu.location}, {edu.location}{/if}{#if edu.details}, {edu.details}{/if}.
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if otherEducation.length > 0}
		<h4>Other Education</h4>
		<div class="space-y-3 ledger">
			{#each otherEducation as edu (edu.id)}
				<CVEntry year={edu.year}>
					{edu.degree}.
					{edu.institution}{#if edu.location}, {edu.location}{/if}.
					{#if edu.details}
						<p class="text-sm mt-1">{edu.details}</p>{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if educationByDate.length === 0}
		<p class="cv-empty">No educational qualifications listed.</p>
	{/if}
</section>
