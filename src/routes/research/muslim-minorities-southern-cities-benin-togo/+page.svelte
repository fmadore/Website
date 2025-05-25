<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/components/panels/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/components/panels/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import { page } from '$app/stores'; // Import page store
    import { onMount, onDestroy } from 'svelte'; // Import lifecycle functions
    import { browser } from '$app/environment'; // Import browser check

    // Pre-construct breadcrumb items with evaluated paths
    const breadcrumbItems = [
        { label: 'Research', href: `${base}/research` },
        { label: 'Muslim Minorities in Southern Cities', href: `${base}/research/muslim-minorities-southern-cities-benin-togo` }
    ];

    // Generate Breadcrumb JSON-LD
    const breadcrumbJsonLdString = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.label,
            "item": `${$page.url.origin}${item.href}`
        }))
    });

    // Manage JSON-LD script injection
    const breadcrumbJsonLdScriptId = 'breadcrumb-json-ld';

    onMount(() => {
        if (browser && breadcrumbJsonLdString && !document.getElementById(breadcrumbJsonLdScriptId)) {
            const script = document.createElement('script');
            script.id = breadcrumbJsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = breadcrumbJsonLdString;
            document.head.appendChild(script);
        }
    });

    onDestroy(() => {
        if (browser) {
            const script = document.getElementById(breadcrumbJsonLdScriptId);
            if (script) {
                document.head.removeChild(script);
            }
        }
    });
</script>

<SEO title="Muslim Minorities in Southern Cities of Benin and Togo | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
    <div class="grid">
        <div class="main-content">
			<Breadcrumb items={breadcrumbItems} />
			
			<PageHeader 
				title="Muslim Minorities in Southern Cities of Benin and Togo"
			/>
            
            <div class="project-image">
                <img src="{base}/images/research/muslim-minorities.webp" alt="Muslim Minorities in Southern Cities of Benin and Togo" class="w-full h-auto" />
            </div>
            
            <div class="project-content">
                <p>Muslims in Benin and Togo rarely make international headlines, except when analysts warn that jihadist groups based in the Sahel are moving south towards the Gulf of Guinea. My project shifts the focus from these narrow security concerns to the everyday lives of Muslim minorities in Cotonou, Porto-Novo and Lomé. Combining archival work with long-term ethnography, it traces their trajectories from the 1960s to the present to see how living as an internally diverse minority in a Christian-majority environment shapes their religious practices, civic engagement and claims to citizenship.</p>
                <p>One consistent finding is how elites instrumentalise fear of extremism. In Togo, political leaders have branded opposition figures "Salafi" to legitimise arrests, while senior Muslim leaders sometimes recycle the same label to sideline rivals within their own organisations. These manoeuvres show that talk of radicalisation often reflects local power struggles rather than imported jihadist ideologies <ItemReference id="lutte-terrorisme-salafisme-benin-togo-2022" />.</p>
                <p>During the 2017-18 protests in Lomé, the regime drew a sharp line between "good" and "bad" Muslims in order to fracture an opposition coalition led by Muslim politicians <ItemReference id="good-muslim-bad-muslim-togo-2021" />. In Benin, controversy erupted when a Cotonou imam successfully entered parliament in 2019; the episode exposed generational divides over who can legitimately speak for Muslims in a minority context <ItemReference id="beninese-imam-election-2022" />.</p>
                <p>The project also explored the plurality of ways in which Muslim youth and women make sense of their religious identity in their everyday lives, beyond established analytical categories (Sufi, reformist, Salafi). Their fluid practices echo the argument of "Repenser la catégorisation religieuse à partir du Bénin, terre du vodun" <ItemReference id="repenser-categorisation-religieuse-benin-2026" /> that official statistics overstate the advance of monotheism and overlook the hybrid, overlapping rituals that many believers quietly practice.</p>
                <p>Taken together, the research shows that minority status is both a constraint and a resource. It can marginalise Muslims in national politics, but also enable strategic alliances, entrepreneurial experimentation and new forms of piety. By looking beyond security tropes, the project offers a fuller picture of how southern Beninese and Togolese Muslims negotiate faith, power and belonging in one of West Africa's most religiously plural zones.</p>
            </div>
        </div>
        
        <div class="sidebar">
            <RelevantPublications projectName="Muslim Minorities in Southern Cities of Benin and Togo" limit={5} />
            <div class="mt-6">
                <RelevantCommunications projectName="Muslim Minorities in Southern Cities of Benin and Togo" limit={5} />
            </div>
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