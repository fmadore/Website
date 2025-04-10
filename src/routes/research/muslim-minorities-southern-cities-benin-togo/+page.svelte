<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/components/organisms/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/components/organisms/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
</script>

<SEO title="Muslim Minorities in Southern Cities of Benin and Togo | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
    <div class="main-content">
		<Breadcrumb items={[
			{ label: 'Research', href: '/research' },
			{ label: 'Muslim Minorities in Southern Cities of Benin and Togo', href: '' }
		]} />
		
		<PageHeader 
			title="Muslim Minorities in Southern Cities of Benin and Togo"
		/>
        
        <div class="project-image">
            <img src="{base}/images/research/muslim-minorities.webp" alt="Muslim Minorities in Southern Cities of Benin and Togo" class="w-full h-auto" />
        </div>
        
        <div class="project-content">
            <p>This research project examined the understudied Muslim minority communities of southern Benin and Togo since the late colonial era (1950s). While recent reports on the deteriorating security situation in Burkina Faso have raised fears of jihadism spreading to neighbouring states bordering the Gulf of Guinea, including Benin and Togo, Islam in this region remains largely unknown. The project aimed to move beyond a reductive focus on "radicalisation" by interrogating how Muslims' political position as a minority in Christian-majority settings affects their experiences, self-understandings, and political stakes. It also explored the plurality of ways in which Muslim youth and women make their religious identity meaningful in their everyday lives, beyond established analytical categories (Sufi, reformist, Salafi).</p>
        </div>
    </div>
    
    <div class="sidebar">
        <RelevantPublications projectName="Muslim Minorities in Southern Cities of Benin and Togo" limit={5} />
        <div class="mt-6">
            <RelevantCommunications projectName="Muslim Minorities in Southern Cities of Benin and Togo" limit={5} />
        </div>
    </div>
</div>

<style>
    /* Styles for mobile first */
    .main-content {
        width: 100%;
    }
    
    .sidebar {
        width: 100%;
        margin-top: var(--spacing-8);
    }
    
    .project-image {
        margin-bottom: var(--spacing-8);
        border-radius: var(--border-radius-md);
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    
    .project-image img {
        width: 100%;
        height: auto;
        display: block;
    }

    /* Grid layout for medium screens and up */
    @media (min-width: 768px) {
        .grid { /* Apply to the .grid container */
            display: grid;
            grid-template-columns: 1fr 300px; /* Main content takes remaining space, sidebar is 300px */
            gap: var(--spacing-8); /* Increased gap */
        }

        .main-content {
            width: auto; /* Reset width */
        }

        .sidebar {
            width: auto; /* Reset width */
            margin-top: 0; /* Reset margin */
        }
    }
</style>