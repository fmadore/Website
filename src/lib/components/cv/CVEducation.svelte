<script lang="ts">
	import { educationByDate } from '$lib/data/education';
	import { splitEducation } from '$lib/utils/cvSections';
	import { quoteTitle, typesetQuotes } from '$lib/utils/typesetQuotes';
	import CVEntry from './CVEntry.svelte';

	const {
		degrees,
		trainings,
		certificates,
		other: otherEducation
	} = splitEducation(educationByDate);
</script>

<section>
	<h3>Education</h3>

	{#if degrees.length > 0}
		<h4>Degrees</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each degrees as edu (edu.id)}
				<CVEntry year={edu.year}>
					{typesetQuotes(edu.degree)}.
					{typesetQuotes(edu.institution)}{#if edu.location}, {typesetQuotes(edu.location)}{/if}.
					{#if edu.thesisTitle}
						<p class="cv-detail">Dissertation: {quoteTitle(edu.thesisTitle)}</p>{/if}
					{#if edu.details}
						<p class="cv-detail">{typesetQuotes(edu.details)}</p>{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if trainings.length > 0}
		<h4>Digital Humanities Trainings</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each trainings as edu (edu.id)}
				<CVEntry year={edu.year}>
					{quoteTitle(edu.degree)}.
					{typesetQuotes(edu.institution)}{#if edu.location}, {typesetQuotes(
							edu.location
						)}{/if}{#if edu.details}, {typesetQuotes(edu.details)}{/if}.
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if certificates.length > 0}
		<h4>Certificates</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each certificates as edu (edu.id)}
				<CVEntry year={edu.year}>
					{typesetQuotes(edu.degree)}.
					{typesetQuotes(edu.institution)}{#if edu.location}, {typesetQuotes(
							edu.location
						)}{/if}{#if edu.details}, {typesetQuotes(edu.details)}{/if}.
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if otherEducation.length > 0}
		<h4>Other Education</h4>
		<div class="ledger ledger--tight ledger--ruled" data-cv-ledger>
			{#each otherEducation as edu (edu.id)}
				<CVEntry year={edu.year}>
					{typesetQuotes(edu.degree)}.
					{typesetQuotes(edu.institution)}{#if edu.location}, {typesetQuotes(edu.location)}{/if}.
					{#if edu.details}
						<p class="cv-detail">{typesetQuotes(edu.details)}</p>{/if}
				</CVEntry>
			{/each}
		</div>
	{/if}

	{#if educationByDate.length === 0}
		<p class="cv-empty">No educational qualifications listed.</p>
	{/if}
</section>
