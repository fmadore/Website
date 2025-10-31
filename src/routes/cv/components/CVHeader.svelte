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
<section class="mb-6 text-sm text-light cv-contact-section">
	<!-- Address -->
	<div class="cv-contact-group">
		<Icon icon="mdi:map-marker" class="text-light shrink-0" width="20" height="20" />
		<div>
			Leibniz-Zentrum Moderner Orient<br />
			Kirchweg 33<br />
			14129 Berlin<br />
			Germany
		</div>
	</div>
	<!-- Links -->
	<div class="cv-links-group">
		<div class="cv-link-item">
			<Icon icon="mdi:email" class="text-light shrink-0" width="20" height="20" />
			<a href="mailto:frederick.madore@zmo.de">frederick.madore@zmo.de</a>
		</div>
		<div class="cv-link-item">
			<Icon icon="mdi:web" class="text-light shrink-0" width="20" height="20" />
			<a href="https://www.frederickmadore.com" target="_blank" rel="noopener noreferrer"
				>www.frederickmadore.com</a
			>
		</div>
		<div class="cv-link-item">
			<Icon icon="mdi:linkedin" class="text-light shrink-0" width="20" height="20" />
			<a
				href="https://www.linkedin.com/in/frederickmadore/"
				target="_blank"
				rel="noopener noreferrer">LinkedIn</a
			>
		</div>
		<div class="cv-link-item">
			<Icon icon="mdi:github" class="text-light shrink-0" width="20" height="20" />
			<a href="https://github.com/fmadore" target="_blank" rel="noopener noreferrer">GitHub</a>
		</div>
		<div class="cv-link-item">
			<Icon icon="simple-icons:orcid" class="text-light shrink-0" width="20" height="20" />
			<a href="https://orcid.org/0000-0003-0959-2092" target="_blank" rel="noopener noreferrer"
				>ORCID</a
			>
		</div>
	</div>
</section>

<style>
	.cv-main-title,
	.cv-subtitle,
	.cv-date {
		text-align: center;
	}

	/* Contact section layout */
	.cv-contact-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-6);
	}

	.cv-contact-group {
		display: flex;
		align-items: start;
		gap: var(--spacing-2);
	}

	.cv-links-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-1);
	}

	.cv-link-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-2);
	}

	/* Desktop layout - side by side */
	@media (min-width: 768px) {
		.cv-contact-section {
			flex-direction: row;
			justify-content: space-between;
			align-items: start;
			gap: var(--spacing-6);
		}

		.cv-links-group {
			align-items: end;
		}

		.cv-link-item {
			flex-direction: row-reverse;
		}
	}
</style>
