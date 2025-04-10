<script lang="ts">
	import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import { ExternalLinkIcon } from 'lucide-svelte'; // Using an icon for external links
    import { base } from '$app/paths'; // Import base path
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';

	// Pre-construct breadcrumb items with evaluated paths
	const breadcrumbItems = [
		{ label: "Digital Humanities", href: `${base}/digital-humanities` },
		{ label: "Islam Burkina Faso Collection", href: `${base}/digital-humanities/islam-burkina-faso-collection` }
	];
</script>

<SEO
	title="Islam Burkina Faso Collection | Frédérick Madore"
	description="Learn about the Islam Burkina Faso Collection, an open access digital database on Islam and Muslims in Burkina Faso."
/>

<div class="container">
    <Breadcrumb items={breadcrumbItems} />

	<PageHeader title="Islam Burkina Faso Collection (2018-2023)" />

    <img src={`${base}/images/digital-humanities/islam-burkinafaso-banner.webp`} alt="Banner for Islam Burkina Faso Collection" class="banner-image" />

	<section class="content-section">
		<p>
			Launched in 2021, the <em
				>Islam Burkina Faso Collection</em
			> is an open access digital database containing over 2,900 archival documents, newspaper
			articles, Islamic publications of various forms, and photographs on Islam and Muslims in
			Burkina Faso. The site also indexes more than 275 bibliographical references of books, book
			chapters, journal articles, dissertations and theses on the topic. In addition to the
			metadata attribution, optical character recognition (OCR) has also been applied to each
			document. An index of nearly 1000 events, locations, organizations, people, and topics is also
			available.
		</p>
        <p class="external-link">
            <a href="https://web.archive.org/web/20240420024750/https://islam.domains.uflib.ufl.edu/s/bf/page/home" target="_blank" rel="noopener noreferrer">
                Visit the Collection Website <ExternalLinkIcon size={16} />
            </a>
        </p>
		<p>
			This project is one of the first digital humanities initiatives to be published under a new
			University of Florida Libraries program, <a href="https://librarypress.domains.uflib.ufl.edu/" target="_blank" rel="noopener noreferrer">LibraryPress@UF</a>. This program, an imprint of the
			Libraries and the University of Florida Press, seeks to develop public scholarship across
			formats that extend and complement the work of traditional academic publishing.
		</p>

		<h3>Learn More</h3>
		<p>
			To learn more about this project, see Frédérick Madore, "La <em>Collection Islam Burkina Faso</em> : promesses et défis des humanités numériques".
			<em
				>Revue d'Histoire Contemporaine de l'Afrique</em
			> (2021). <a href="https://doi.org/10.51185/journals/rhca.2021.e610" target="_blank" rel="noopener noreferrer">DOI: 10.51185/journals/rhca.2021.e610</a>
		</p>
	</section>

	<section class="content-section">
		<h2>Award</h2>
		<p>I won a <a href="https://etcl.uvic.ca/2023/01/17/2023-open-scholarship-awards/" target="_blank" rel="noreferrer noopener"><em>2023 Emerging Open Scholarship Award</em></a>,&nbsp;sponsored by the <a href="https://c-ski.ca/" target="_blank" rel="noreferrer noopener">Canadian Social Knowledge Institute (C-SKI)</a> and its partners,&nbsp;for my work on the <em>Islam Burkina Faso Collection</em>.</p>
	</section>

	<section class="content-section">
		<h2>Reviews</h2>

		<div class="review">
			<p>
				Robert Launay, "Review: Islam Burkina Faso Collection", <em
					>Reviews in Digital Humanities</em
				> 4, no. 4 (2023). <a href="https://doi.org/10.21428/3e88f64f.89e71c81" target="_blank" rel="noopener noreferrer">DOI: 10.21428/3e88f64f.89e71c81</a>
			</p>
			<blockquote>
				"The collection is an invaluable research tool for scholars in or outside Burkina Faso,
				offering access to material that is difficult or impossible to find outside — and sometimes
				even inside — the country [...] The collection is an extremely important contribution and
				critical aid to scholarship on Islam in West Africa."
			</blockquote>
		</div>

		<div class="review">
			<p>
				Vincent Hiribarren, "Review of Frédérick Madore 'Islam Burkina Faso Collection'", <em
					>Mande Studies</em
				> 24 (2022): 325–27. <a href="https://doi.org/10.2979/mnd.2022.a908483" target="_blank" rel="noopener noreferrer">DOI: 10.2979/mnd.2022.a908483</a>
			</p>
			<blockquote>
				"Obviously, this is an impressive achievement, and the project launched in 2021 by Frédérick
				Madore will become an increasingly useful repository since travel in and to Burkina Faso has
				become more difficult. [...] What the interface also clearly offers is a potential
				re-interpretation of the documents used by Madore and new possible enquiries for students
				and professional researchers. The two exhibitions available on the website demonstrate the
				potential of such an approach and the way the database can also become part of our teaching.
				[...] the Islam Burkina Faso Collection is already a fascinating resource with a significant
				potential for future researchers."
			</blockquote>
		</div>
	</section>
</div>

<style>
	.container {
		max-width: 900px; /* Or adjust as needed */
		margin: 2rem auto;
		padding: 0 1rem;
	}

    .banner-image {
        width: 100%;
        height: auto; /* Maintain aspect ratio */
        max-height: 300px; /* Limit max height */
        object-fit: cover; /* Cover the area, might crop */
        border-radius: var(--border-radius-md); /* Optional rounded corners */
        margin-bottom: var(--spacing-8); /* Spacing below banner */
        display: block; /* Ensure it's a block element */
    }

	.content-section {
		margin-bottom: 2.5rem; /* var(--spacing-10) */
	}

	.content-section h2 {
		font-size: var(--font-size-xl);
		margin-bottom: var(--spacing-4);
		color: var(--color-accent); /* Or your preferred heading color */
		border-bottom: 1px solid var(--color-border);
		padding-bottom: var(--spacing-2);
	}

    .content-section h3 {
		font-size: var(--font-size-lg);
		margin-top: var(--spacing-6);
		margin-bottom: var(--spacing-3);
		color: var(--color-text-secondary);
	}

	.content-section p {
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--spacing-4);
	}

	.review {
		margin-bottom: var(--spacing-6);
		padding-left: var(--spacing-4);
		border-left: 3px solid var(--color-primary); /* Accent border */
	}

	blockquote {
		margin-top: var(--spacing-2);
		margin-left: 0; /* Reset browser default */
        margin-right: 0;
		padding: var(--spacing-3) var(--spacing-4);
		background-color: var(--color-background-secondary);
		border-radius: var(--border-radius);
		font-style: italic;
		color: var(--color-text-secondary);
        line-height: var(--line-height-relaxed);
	}

    .external-link a {
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-1);
        text-decoration: none;
        color: var(--color-primary-dark);
        font-weight: 500;
    }
    .external-link a:hover {
        text-decoration: underline;
    }

	a {
		color: var(--color-primary-dark); /* var(--color-link); */
	}

	a:hover {
		text-decoration: underline;
	}

</style> 