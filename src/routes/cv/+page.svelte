<script lang="ts">
	import { publicationsByDate } from '$lib/data/publications';
	import { communicationsByDate } from '$lib/data/communications';
	import { fieldworksByDate } from '$lib/data/fieldworks';
	import { educationByDate } from '$lib/data/education';
	import { appointmentsByDate } from '$lib/data/appointments';
	import { grantsByDate } from '$lib/data/grants';
	import { awardsByDate } from '$lib/data/awards';
	import { peerReviewsByDate } from '$lib/data/peer-reviews';
	import { mediaAppearancesByDate } from '$lib/data/media-appearances';
	import { editorialMembershipsByDate } from '$lib/data/editorial-memberships';
	import { MapPin, Mail, Linkedin, Github } from 'lucide-svelte';
	import type { Publication, Communication, Fieldwork, Education, Appointment, Grant, Award, PeerReview, MediaAppearance, EditorialMembership } from '$lib/types';
	import SEO from '$lib/SEO.svelte';

	// Filter education items by type
	const degrees = educationByDate.filter(edu => edu.type === 'Degree');
	const trainings = educationByDate.filter(edu => edu.type === 'Training');
	const certificates = educationByDate.filter(edu => edu.type === 'Certificate');
	const otherEducation = educationByDate.filter(edu => 
		!['Degree', 'Training', 'Certificate'].includes(edu.type || '')
	);

	// --- Publication Grouping ---
	const publicationTypeOrder: Publication['type'][] = [
		'book', 
		'special-issue', 
		'article', 
		'chapter', 
		'report', 
		'encyclopedia',
		'dissertation', // Added dissertation here, adjust/remove if needed
		'blogpost'      // Added blogpost here, adjust/remove if needed
	];

	// Helper function to get a display name for the type
	function getPublicationTypeDisplayName(type: Publication['type']): string {
		switch (type) {
			case 'book': return 'Books';
			case 'special-issue': return 'Guest Edited Journals';
			case 'article': return 'Journal Articles';
			case 'chapter': return 'Book Chapters';
			case 'report': return 'Report';
			case 'encyclopedia': return 'Encyclopedia Entry';
			case 'dissertation': return 'Dissertation';
			case 'blogpost': return 'Blog Posts';
			default: return 'Other Publications'; // Fallback
		}
	}

	// Group publications by type
	const publicationsByType = publicationsByDate.reduce((acc, pub) => {
		const type = pub.type || 'other'; // Default to 'other' if type is missing
		if (!acc[type]) {
			acc[type] = [];
		}
		acc[type].push(pub);
		return acc;
	}, {} as Record<Publication['type'] | 'other', Publication[]>);

	// Get types present in the data that are also in our desired order
	const presentPublicationTypes = publicationTypeOrder.filter(type => publicationsByType[type]?.length > 0);

	// Get any remaining types not in the main order (optional, if you want an 'Other' section)
	const otherPublicationTypes = Object.keys(publicationsByType)
	    .filter(type => !publicationTypeOrder.includes(type as Publication['type']) && publicationsByType[type as Publication['type']].length > 0);

	// --- Communication Grouping ---
	const organizedPanels = communicationsByDate.filter(comm => comm.type === 'panel');
	const presentedPapers = communicationsByDate.filter(comm => comm.type === 'conference');
	const organizedEvents = communicationsByDate.filter(comm => comm.type === 'event');
	const invitedTalks = communicationsByDate.filter(comm => comm.type === 'lecture' || comm.type === 'seminar');
	
	// Catch any remaining types (optional)
	const otherCommunications = communicationsByDate.filter(comm => 
		!['panel', 'conference', 'event', 'lecture', 'seminar'].includes(comm.type || '') 
	);

</script>

<SEO
	title="Curriculum Vitae - Frédérick Madore"
	description="Curriculum Vitae of Frédérick Madore, detailing publications, communications, activities, and fieldwork."
/>

<div class="cv-container p-8 max-w-4xl mx-auto bg-white shadow-md rounded-lg">
	<h1 class="text-3xl font-bold mb-2 border-b pb-2">Curriculum Vitae</h1>
	<h2 class="text-xl font-semibold mb-4">Frédérick Madore</h2>
	
	<!-- Contact Info Section -->
	<section class="mb-6 text-sm text-light flex flex-wrap gap-x-6 gap-y-2 items-start">
		<!-- Address -->
		<div class="flex items-start gap-2">
			<MapPin class="text-light flex-shrink-0" />
			<div>
				Leibniz-Zentrum Moderner Orient<br />
				Kirchweg 33<br />
				14129 Berlin<br />
				Germany
			</div>
		</div>
		<!-- Links -->
		<div class="flex flex-col gap-1">
			<div class="flex items-center gap-2">
				<Mail class="text-light flex-shrink-0" />
				<a href="mailto:frederick.madore@zmo.de">frederick.madore@zmo.de</a>
			</div>
			<div class="flex items-center gap-2">
				<Linkedin class="text-light flex-shrink-0" />
				<a href="https://www.linkedin.com/in/frederickmadore/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
			</div>
			<div class="flex items-center gap-2">
				<Github class="text-light flex-shrink-0" />
				<a href="https://github.com/fmadore" target="_blank" rel="noopener noreferrer">GitHub</a>
			</div>
		</div>
	</section>

	<!-- Education Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Education</h3>

		{#if degrees.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Degrees</h4>
			<ul>
				{#each degrees as edu (edu.id)}
					<li class="mb-3 ml-4">
						<span class="font-medium">{edu.degree}</span> ({edu.year}).
						<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
						{#if edu.thesisTitle} <p class="ml-4 text-sm italic">Thesis: {edu.thesisTitle}</p>{/if}
						{#if edu.details} <p class="ml-4 text-sm">{edu.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if trainings.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Digital Humanities Trainings</h4>
			<ul>
				{#each trainings as edu (edu.id)}
					<li class="mb-3 ml-4">
						<span class="font-medium">{edu.degree}</span> ({edu.year}).
						<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
						{#if edu.details} <p class="ml-4 text-sm">{edu.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if certificates.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Certificates</h4>
			<ul>
				{#each certificates as edu (edu.id)}
					<li class="mb-3 ml-4">
						<span class="font-medium">{edu.degree}</span> ({edu.year}).
						<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
						{#if edu.details} <p class="ml-4 text-sm">{edu.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if otherEducation.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2">Other Education</h4>
			<ul>
				{#each otherEducation as edu (edu.id)}
					<li class="mb-3 ml-4">
						<span class="font-medium">{edu.degree}</span> ({edu.year}).
						<em>{edu.institution}</em>{#if edu.location}, {edu.location}{/if}.
						{#if edu.details} <p class="ml-4 text-sm">{edu.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		{#if educationByDate.length === 0}
			<p class="text-light">No educational qualifications listed.</p>
		{/if}
	</section>

	<!-- Professional Appointments Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Professional Appointments</h3>
		{#if appointmentsByDate.length > 0}
			<ul>
				{#each appointmentsByDate as appt (appt.id)}
					<li class="mb-3">
						<span class="font-medium">{appt.title}</span>, <em>{appt.institution}</em>{#if appt.location}, {appt.location}{/if}.
						<span class="block ml-4 text-sm text-light">{appt.dateRangeString}</span>
						{#if appt.details} <p class="ml-4 text-sm">{appt.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-light">No professional appointments listed.</p>
		{/if}
	</section>

	<!-- Grants and Fellowships Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Grants & Fellowships</h3>
		{#if grantsByDate.length > 0}
			<ul>
				{#each grantsByDate as grant (grant.id)}
					<li class="mb-3">
						<span class="font-medium">{grant.title}</span>, <em>{grant.funder}</em>.
						<span class="block ml-4 text-sm text-light">{grant.dateRangeString}{#if grant.amount} ({grant.amount.toLocaleString('en-US')} {grant.currency}){/if}{#if grant.status && grant.status !== 'Awarded'} [{grant.status}]{/if}</span>
						{#if grant.details} <p class="ml-4 text-sm">{grant.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-light">No grants or fellowships listed.</p>
		{/if}
	</section>

	<!-- Awards and Honors Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Awards & Honors</h3>
		{#if awardsByDate.length > 0}
			<ul>
				{#each awardsByDate as award (award.id)}
					<li class="mb-3">
						<span class="font-medium">{award.title}</span>, <em>{award.institution}</em> ({award.year}).
						{#if award.details} <p class="ml-4 text-sm">{award.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-light">No awards or honors listed.</p>
		{/if}
	</section>

	<!-- Publications Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-2 border-b pb-1">Publications</h3> 
		{#if publicationsByDate.length > 0}
			{#each presentPublicationTypes as pubType (pubType)}
				{#if publicationsByType[pubType] && publicationsByType[pubType].length > 0}
					<h4 class="text-lg font-semibold mt-4 mb-2">{getPublicationTypeDisplayName(pubType)}</h4>
					<ul class="list-disc pl-6">
						{#each publicationsByType[pubType] as pub (pub.id)}
							<li class="mb-3">
								{#if pub.authors}{pub.authors.join(', ')}. {/if}
								({pub.year}).
								{#if pub.type !== 'book'}"{pub.title}".{/if}
								{#if pub.type === 'article' && pub.journal}
									In <em>{pub.journal}</em>{#if pub.volume}({pub.volume}{#if pub.issue}:{pub.issue}{/if}){/if}{#if pub.pages}: {pub.pages}{/if}.
								{:else if pub.type === 'chapter' && pub.book}
									In {#if pub.editors}<em>{pub.editors} (ed.), </em>{/if}<em>{pub.book}</em>{#if pub.publisher}, {pub.publisher}{/if}{#if pub.pages}, pp. {pub.pages}{/if}.
								{:else if pub.type === 'book' && pub.publisher}
									<em>{pub.title}</em>. {pub.publisher}{#if pub.placeOfPublication}, {pub.placeOfPublication}{/if}.
								{:else if pub.type === 'special-issue' && pub.journal}
									Guest Editor for Special Issue: "{pub.title}", <em>{pub.journal}</em>{#if pub.volume}({pub.volume}{#if pub.issue}:{pub.issue}{/if}){/if}.
								{:else if pub.type === 'report'}
									<em>{pub.title}</em>{#if pub.publisher}, {pub.publisher}{/if}.
								{:else if pub.type === 'encyclopedia' && pub.encyclopediaTitle}
									In <em>{pub.encyclopediaTitle}</em>{#if pub.publisher}, {pub.publisher}{/if}.
								{:else if pub.type === 'dissertation' && pub.university}
									<em>{pub.title}</em>. Ph.D. Dissertation, {pub.university}{#if pub.department}, {pub.department}{/if}.
								{:else if pub.type === 'blogpost'}
									{#if pub.url}<a href="{pub.url}" target="_blank" rel="noopener noreferrer">"{pub.title}"</a>{/if}. Blog Post.
								{:else}
									<!-- Generic fallback -->
									{#if pub.journal}In <em>{pub.journal}</em>.{/if}
									{#if pub.book}In <em>{pub.book}</em>.{/if}
									{#if pub.publisher}{pub.publisher}.{/if}
								{/if}
								{#if pub.doi}<a href="https://doi.org/{pub.doi}" target="_blank" rel="noopener noreferrer" class="ml-1">[DOI]</a>{/if}
								{#if pub.url && pub.type !== 'blogpost'}<a href="{pub.url}" target="_blank" rel="noopener noreferrer" class="ml-1">[Link]</a>{/if}
							</li>
						{/each}
					</ul>
				{/if}
			{/each}

			<!-- Optional: Section for other publication types -->
			{#if otherPublicationTypes.length > 0}
				<h4 class="text-lg font-semibold mt-4 mb-2">Other</h4>
				<ul class="list-disc pl-6">
					{#each otherPublicationTypes as pubType (pubType)}
						{#each publicationsByType[pubType as Publication['type']] as pub (pub.id)}
							<li class="mb-3">
								<!-- Simplified display for other types -->
								<span class="font-medium">{pub.title}</span> ({pub.year}). 
								{#if pub.type}<span class="text-sm bg-border px-1 rounded">{pub.type}</span>{/if}
								{#if pub.url}<a href="{pub.url}" target="_blank" rel="noopener noreferrer" class="ml-1">[Link]</a>{/if}
							</li>
						{/each}
					{/each}
				</ul>
			{/if}
		{:else}
			<p class="text-light">No publications listed.</p>
		{/if}
	</section>

	<!-- Conference Participation -->
	{#if organizedPanels.length > 0 || presentedPapers.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Conference Participation</h3>
		
		<!-- Panels Organized -->
		{#if organizedPanels.length > 0}
			<h4 class="text-lg font-semibold mt-3 mb-1 pl-4">Panels Organized</h4>
			<ul class="list-disc pl-8">
				{#each organizedPanels as comm (comm.id)}
					<li class="mb-3">
						"{comm.panelTitle || comm.title}". 
						{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}. 
						{new Date(comm.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Papers Presented -->
		{#if presentedPapers.length > 0}
			<h4 class="text-lg font-semibold mt-3 mb-1 pl-4">Papers Presented</h4>
			<ul class="list-disc pl-8">
				{#each presentedPapers as comm (comm.id)}
					<li class="mb-3">
						{#if comm.authors}{comm.authors.join(', ')}. {/if}
						"{comm.title}". 
						{#if comm.panelTitle}Panel: <em>{comm.panelTitle}</em>. {/if}
						{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}. 
						{new Date(comm.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
					</li>
				{/each}
			</ul>
		{/if}
	</section>
	{/if}

	<!-- Organization of Academic Events -->
	{#if organizedEvents.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Organization of Academic Events</h3>
		<ul class="list-disc pl-6">
			{#each organizedEvents as comm (comm.id)}
				<li class="mb-3">
					{comm.title}. 
					{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}. 
					{new Date(comm.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
				</li>
			{/each}
		</ul>
	</section>
	{/if}

	<!-- Invited Talks -->
	{#if invitedTalks.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Invited Talks</h3>
		<ul class="list-disc pl-6">
			{#each invitedTalks as comm (comm.id)}
				<li class="mb-3">
					{#if comm.authors}{comm.authors.join(', ')}. {/if}
					"{comm.title}". 
					{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}. 
					{new Date(comm.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
				</li>
			{/each}
		</ul>
	</section>
	{/if}
	
	<!-- Optional: Other Communications -->
	{#if otherCommunications.length > 0}
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Other Presentations</h3>
		<ul class="list-disc pl-6">
			{#each otherCommunications as comm (comm.id)}
				<li class="mb-3">
					{comm.title} ({comm.year}). 
					{#if comm.type}<span class="text-sm bg-border px-1 rounded">{comm.type}</span>{/if}
					{#if comm.conference}<em>{comm.conference}</em>{/if}{#if comm.location}, {comm.location}{/if}.
				</li>
			{/each}
		</ul>
	</section>
	{/if}

	<!-- Media Appearances Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Media Appearances</h3>
		{#if mediaAppearancesByDate.length > 0}
			<ul>
				{#each mediaAppearancesByDate as media (media.id)}
					<li class="mb-3">
						{media.type === 'interview' ? 'Interviewed by' : 'Appeared in'} 
						<em>{media.outlet}</em>{#if media.program}, {media.program}{/if}. 
						{new Date(media.dateISO).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
						<span class="block ml-4 text-sm text-light">Topic: {media.topic}</span>
						{#if media.url}<a href="{media.url}" target="_blank" rel="noopener noreferrer" class="ml-4 text-sm">[Link]</a>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-light">No media appearances listed.</p>
		{/if}
	</section>

	<!-- NEW Service to Profession Section -->
	<section class="mb-8">
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Service to Profession</h3>

		<!-- Peer Review Section (Now nested) -->
		{#if peerReviewsByDate.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2 pl-4">Peer Review Activities</h4> 
			<ul class="list-disc pl-8"> 
				{#each peerReviewsByDate as review (review.id)}
					<li class="mb-3">
						<span class="font-medium">{review.type}</span>{#if review.journal} for <em>{review.journal}</em>{/if}{#if review.publisher} for {review.publisher}{/if} ({review.year}).
						{#if review.details} <p class="ml-4 text-sm">{review.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Editorial Board Memberships Section (Now nested) -->
		{#if editorialMembershipsByDate.length > 0}
			<h4 class="text-lg font-semibold mt-4 mb-2 pl-4">Editorial Board Memberships</h4> 
			<ul class="list-disc pl-8"> 
				{#each editorialMembershipsByDate as member (member.id)}
					<li class="mb-3">
						<span class="font-medium">{member.role}</span>, <em>{member.journal}</em>.
						<span class="block ml-4 text-sm text-light">{member.dateRangeString}</span>
						{#if member.details} <p class="ml-4 text-sm">{member.details}</p>{/if}
					</li>
				{/each}
			</ul>
		{/if}

		<!-- Optional: Message if no service activities -->
		{#if peerReviewsByDate.length === 0 && editorialMembershipsByDate.length === 0}
			<p class="pl-4 text-light">No service activities listed.</p>
		{/if}

	</section> <!-- End Service to Profession Section -->

	<!-- Fieldwork Section -->
	<section>
		<h3 class="text-2xl font-semibold mb-4 border-b pb-1">Fieldwork</h3>
		{#if fieldworksByDate.length > 0}
			<ul>
				{#each fieldworksByDate as fw (fw.id)}
					<li class="mb-3">
						<span class="font-medium">Fieldwork in {fw.city}, {fw.country}</span> ({fw.year}).
						{#if fw.project} Project: <em>{fw.project}</em>.{/if}
						<!-- Add more fieldwork details as needed -->
					</li>
				{/each}
			</ul>
		{:else}
			<p class="text-light">No fieldwork listed.</p>
		{/if}
	</section>

</div>
