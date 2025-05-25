<script lang="ts">
    import LatestActivities from '$lib/components/panels/LatestActivities.svelte';
    import ProfileBanner from '$lib/components/common/ProfileBanner.svelte';
    import SEO from '$lib/SEO.svelte';
    import { activitiesByYear } from '$lib/data/activities';
    import { base } from '$app/paths';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import { browser } from '$app/environment';
    import type { PageData } from './$types';

    let { data } = $props<{ data: PageData }>();
    const jsonLdString = $derived(data.jsonLdString);

    const jsonLdScriptId = 'person-json-ld';

    $effect(() => {
        if (browser && jsonLdString) {
            if (document.getElementById(jsonLdScriptId)) return;
            const script = document.createElement('script');
            script.id = jsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = jsonLdString;
            document.head.appendChild(script);

            return () => {
                const scriptElement = document.getElementById(jsonLdScriptId);
                if (scriptElement) document.head.removeChild(scriptElement);
            };
        }
    });

    // Years with content - dynamically created from activities data
    const years = $derived(Object.entries(activitiesByYear).map(([year, activities]) => ({
        year: parseInt(year),
        count: activities.length
    })).sort((a, b) => b.year - a.year));
</script>

<SEO description="Frédérick Madore, Research Fellow at ZMO, studies Islam in francophone West Africa through fieldwork and digital humanities." />

<div class="container max-w-7xl">
    <ProfileBanner />    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">        <div class="md:col-span-2 bg-default rounded-lg p-8 shadow-sm border border-default transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <p class="leading-relaxed">I am a Research Fellow at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in the "<a href="https://www.zmo.de/en/research/religion-and-intellectual-culture" target="_blank" rel="noopener noreferrer">Religion and Intellectual Culture</a>" unit, where I examine how Islamic movements and Muslim intellectuals have navigated secular governance and shaped public discourse in Francophone West Africa since the 1960s. Through extensive fieldwork and archival research in Benin, Burkina Faso, Côte d'Ivoire, and Togo, I am investigating the intersection of Islamic activism, secularism and Muslim politics. I am paying particular attention to how educational institutions have served as key sites of religious mobilisation.</p>
            
            <p class="leading-relaxed">My recent book, <em>Religious Activism on Campuses in Togo and Benin</em> <ItemReference id="religious-activism-campuses" />, explores how Christian and Muslim student associations emerged in the 1970s and profoundly reshaped university life in Lomé and Abomey-Calavi, challenging prevailing secular ideologies.</p>
            
            <p class="leading-relaxed">A significant dimension of my work involves <a href="{base}/digital-humanities" data-sveltekit-preload-data>digital humanities</a> (DH) approaches. I am developing the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, an open-access database featuring over 13,500 items documenting Islam across the region. Using computational methods and artificial intelligence workflows, I analyse this vast corpus to uncover large-scale patterns in religious mobilisation, the evolution of Islamic discourse, the media's representation of Islam and the shifting relationships between Muslim communities and state authorities. Data visualisation techniques enable me to translate these computational findings into accessible narratives that reveal new aspects of Muslim public engagement.</p>
            
            <p class="leading-relaxed">I am also the author of <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em> <ItemReference id="sphere-publique-musulmane" /> and co-editor of <em>Religiosity on University Campuses in Africa</em> <ItemReference id="religiosity-university-campuses" />. I have also co-edited two special journal issues: "Muslim Minorities in Africa, Part 1" <ItemReference id="muslim-minorities-africa-1" /> & "Part 2" <ItemReference id="muslim-minorities-africa-2" /> and "Les acteurs religieux africains à l'ère du numérique" <ItemReference id="acteurs-religieux-numerique" />. My <a href="{base}/publications" data-sveltekit-preload-data>research</a> has been published in eleven peer-reviewed journals and six edited volumes.</p>

            <p class="leading-relaxed">Beyond academia, I apply this regional expertise as a consultant for <a href="https://communitology.co/" target="_blank" rel="noopener noreferrer">Communitology</a>, developing specialized Country of Origin Information (COI) reports for asylum and immigration cases involving Benin, Côte d'Ivoire, and Togo.</p>

            <p class="leading-relaxed">I hold a Ph.D. with distinction in History from <a href="https://www.ulaval.ca/" target="_blank" rel="noopener noreferrer">Université Laval</a> and was previously a <a href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html" target="_blank" rel="noopener noreferrer">Banting Postdoctoral Fellow</a> at the <a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer">University of Florida</a>. Through my ongoing <a href="{base}/research">research</a> and <a href="{base}/digital-humanities">DH projects</a>, I explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>        </div>
        <aside class="bg-default rounded-lg p-6 shadow-sm border border-default transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <LatestActivities limit={3} />
        </aside>
    </div>
</div>

<style>    /* Content text styling - keeping only what's not available in utilities */
    .grid > div p {
        margin-bottom: var(--spacing-6);
        line-height: 1.625; /* leading-relaxed value */
    }

    .grid > div p:last-child {
        margin-bottom: 0;
    }

    /* Link styling within content */
    .grid > div a {
        color: var(--color-primary);
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
    }

    .grid > div a:hover {
        color: var(--color-primary-dark);
        text-decoration: underline;
    }

    /* External link indicator */
    .grid > div a[target="_blank"]:after {
        content: "↗";
        font-size: 0.8em;
        margin-left: 0.2em;
        opacity: 0.7;
    }

    /* Emphasis styling */
    .grid > div em {
        font-style: italic;
        font-weight: 500;
    }

    /* Lead paragraph styling */
    .grid > div p:first-child {
        font-size: var(--font-size-lg);
        font-weight: 400;
    }

    /* Mobile adjustments */
    @media (max-width: 640px) {
        .grid > div p:first-child {
            font-size: var(--font-size-base);
        }
    }
</style>
