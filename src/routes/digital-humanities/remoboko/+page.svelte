<script lang="ts">
    import SEO from '$lib/SEO.svelte';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import ItemReference from '$lib/components/common/ItemReference.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';

</script>

<SEO 
    title="Remoboko Visualisations | Frédérick Madore" 
    description="Interactive visualizations from the Remoboko research group on religion, morality, and student life in West Africa." 
/>

<div class="container mx-auto px-4 py-8">
    <Breadcrumb items={[
        { label: "Digital Humanities", href: "/digital-humanities" },
        { label: "REMOBOKO", href: "/digital-humanities/remoboko" }
    ]} />
    
    <PageHeader 
        title="REMOBOKO"
    />

    <div class="rounded-box shadow-md p-6 mb-8">

    </div>

    <section class="visualization-section">
        <h2>Fieldwork Locations / Points of Interest</h2>
        <p>Interactive map showing the main locations mentioned in my recent book <ItemReference id="religious-activism-campuses" />.</p> 
        <div class="visualization-embed">
            <iframe src="https://fmadore.github.io/Remoboko/Book_DeGruyter/Maps/points_of_interest.html" width="100%" height="600" frameborder="0" title="Points of Interest Map"></iframe>
        </div>
    </section>

    <section class="visualization-section">
        <h2>Collaborators Overview</h2>
        <p>The Remoboko research group worked with 93 researchers based in 24 different countries. Here's an overview:</p>
        
        <h3>Gender</h3>
        <div class="visualization-embed">
             <img src="https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/collaborators_gender.png" alt="Distribution of Collaborators by Gender" class="responsive-image">
        </div>

        <h3>Countries</h3>
         <div class="visualization-embed">
            <iframe src="https://fmadore.github.io/Remoboko/Final%20report/collaborators_by_country.html" width="100%" height="600" frameborder="0" title="Collaborators by Country"></iframe>
        </div>

        <h3>Affiliations</h3>
         <div class="visualization-embed">
             <iframe src="https://fmadore.github.io/Remoboko/Final%20report/collaborators_map.html" width="100%" height="600" frameborder="0" title="Collaborators Affiliations Map"></iframe>
        </div>
    </section>

    <section class="visualization-section">
        <h2>Publications and Activities Overview</h2>
        
        <h3>Overview</h3>
        <p>This stacked bar chart illustrates the evolution of Remoboko's scientific publications and activities from 2018 to 2024. It categorises publications and activities by type, showing the diverse contributions of members and collaborators across different formats each year.</p>
        <div class="visualization-embed">
             <iframe src="https://fmadore.github.io/Remoboko/Final%20report/activities_type_over_time.html" width="100%" height="600" frameborder="0" title="Remoboko Activities Over Time"></iframe>
        </div>

        <h3>Word clouds</h3>
        <p>These word clouds provide an insight into the work of the Remoboko research group, derived from the available abstracts of all publications and activities of members and collaborators. Presented in French and English, they highlight the most common terms and provide a visual summary of the key themes and concepts that define our research.</p>
        
        <h4>English</h4>
        <div class="visualization-embed">
            <img src="https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/english_wordcloud.png" alt="Wordcloud English" class="responsive-image">
        </div>
        
        <h4>French</h4>
         <div class="visualization-embed">
            <img src="https://raw.githubusercontent.com/fmadore/Remoboko/master/Final%20report/WordClouds/french_wordcloud.png" alt="Wordcloud French" class="responsive-image">
        </div>

    </section>

</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: var(--spacing-4);
    }

    .visualization-section {
        margin-top: var(--spacing-8);
        padding: var(--spacing-8) var(--spacing-6); /* Increased vertical padding */
        background-color: var(--color-background); /* Use defined background variable */
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-sm);
        /* Optional: Add transition for hover effect */
        /* transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out; */
    }
    /* Optional hover effect */
    /* .visualization-section:hover {
        box-shadow: var(--shadow-md);
        transform: translateY(-2px);
    } */

    .visualization-section h2 {
        margin-bottom: var(--spacing-4);
        color: var(--color-text); /* Use defined text variable */
    }
    .visualization-section h3 {
        margin-top: var(--spacing-6);
        margin-bottom: var(--spacing-3);
        color: var(--color-text); /* Use defined text variable */
    }
     .visualization-section h4 {
        margin-top: var(--spacing-5);
        margin-bottom: var(--spacing-2);
        color: var(--color-text); /* Use defined text variable */
        font-size: 1.1rem;
    }

    .visualization-section p {
        margin-bottom: var(--spacing-3);
        line-height: 1.6;
    }

    /* Styles for embedded content */
    .visualization-embed {
        margin-top: var(--spacing-4);
        margin-bottom: var(--spacing-6);
        position: relative; /* Needed for potential aspect ratio padding */
        overflow: hidden; /* Hide parts of iframe that might overflow */
    }
    .visualization-embed iframe {
        display: block; /* Remove extra space below iframe */
        border: 1px solid var(--color-border); /* Optional: add border */
        box-shadow: var(--shadow-sm);
        max-width: 100%; /* Ensure iframe doesn't overflow container */
    }
     .responsive-image {
        max-width: 100%;
        height: auto;
        display: block; /* Remove extra space below image */
        border: 1px solid var(--color-border);
        box-shadow: var(--shadow-sm);
        border-radius: var(--border-radius); /* Added border-radius */
    }
</style>