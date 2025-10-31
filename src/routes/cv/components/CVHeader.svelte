<script lang="ts">
	import Icon from '@iconify/svelte';

	// Get current date formatted as "Day Month Year"
	const today = new Date().toLocaleDateString('en-GB', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<h1 class="text-3xl font-bold mb-2 border-b pb-2 cv-main-title">Curriculum Vitae</h1>
<h2 class="text-xl font-semibold mb-1 cv-subtitle">Frédérick Madore</h2>
<p class="text-sm text-light mb-4 cv-date">{today}</p>

<!-- Contact Info Section -->
<section class="mb-6 text-sm text-light flex flex-wrap gap-x-6 gap-y-2 items-start justify-between">
	<!-- Address -->
	<div class="flex items-start gap-2">
		<Icon icon="mdi:map-marker" class="text-light shrink-0" width="20" height="20" />
		<div>
			Leibniz-Zentrum Moderner Orient<br />
			Kirchweg 33<br />
			14129 Berlin<br />
			Germany
		</div>
	</div>
	<!-- Links -->
	<div class="flex flex-col gap-1 items-end">
		<div class="flex items-center gap-2">
			<a href="mailto:frederick.madore@zmo.de">frederick.madore@zmo.de</a>
			<Icon icon="mdi:email" class="text-light shrink-0" width="20" height="20" />
		</div>
		<div class="flex items-center gap-2">
			<a href="https://www.frederickmadore.com" target="_blank" rel="noopener noreferrer"
				>www.frederickmadore.com</a
			>
			<Icon icon="mdi:web" class="text-light shrink-0" width="20" height="20" />
		</div>
		<div class="flex items-center gap-2">
			<a
				href="https://www.linkedin.com/in/frederickmadore/"
				target="_blank"
				rel="noopener noreferrer">LinkedIn</a
			>
			<Icon icon="mdi:linkedin" class="text-light shrink-0" width="20" height="20" />
		</div>
		<div class="flex items-center gap-2">
			<a href="https://github.com/fmadore" target="_blank" rel="noopener noreferrer">GitHub</a>
			<Icon icon="mdi:github" class="text-light shrink-0" width="20" height="20" />
		</div>
		<div class="flex items-center gap-2">
			<a href="https://orcid.org/0000-0003-0959-2092" target="_blank" rel="noopener noreferrer"
				>ORCID</a
			>
			<Icon icon="simple-icons:orcid" class="text-light shrink-0" width="20" height="20" />
		</div>
	</div>
</section>

<style>
	.cv-main-title,
	.cv-subtitle,
	.cv-date {
		text-align: center;
	}
</style>
