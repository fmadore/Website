<script lang="ts">
    import LatestActivities from '$lib/components/organisms/LatestActivities.svelte';
    import SEO from '$lib/SEO.svelte';
    import { activitiesByYear } from '$lib/data/activities';
    import { base } from '$app/paths';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import { browser } from '$app/environment';
    import type { PageData } from './$types';
    import Icon from '@iconify/svelte';

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

<div class="profile-container">
    <div class="profile-header enhanced-header">
        <div class="profile-photo">
            <img src="{base}/images/Profile-picture.webp" alt="Frédérick Madore" class="rounded-full" width="180" height="180">
        </div>
        <div class="profile-title">
            <h1>About</h1>
            <div class="subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
            <div class="profile-icons">
                <a href="mailto:frederick.madore@zmo.de" target="_blank" rel="noopener" aria-label="Email">
                    <Icon icon="mdi:email" width="26" height="26" />
                </a>
                <a href="https://scholar.google.com/citations?user=naUK0RQAAAAJ" target="_blank" rel="noopener" aria-label="Google Scholar">
                    <Icon icon="academicons:google-scholar" width="26" height="26" />
                </a>
                <a href="https://github.com/fmadore" target="_blank" rel="noopener" aria-label="GitHub">
                    <Icon icon="mdi:github" width="26" height="26" />
                </a>
                <a href="https://www.linkedin.com/in/frederickmadore" target="_blank" rel="noopener" aria-label="LinkedIn">
                    <Icon icon="mdi:linkedin" width="26" height="26" />
                </a>
                <a href="https://orcid.org/0000-0003-0959-2092" target="_blank" rel="noopener" aria-label="ORCID">
                    <Icon icon="simple-icons:orcid" width="26" height="26" />
                </a>
            </div>
        </div>
    </div>

    <div class="profile-content">
        <div class="main-content main-content-card">
            <p>I am a Research Fellow at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in the "<a href="https://www.zmo.de/en/research/religion-and-intellectual-culture" target="_blank" rel="noopener noreferrer">Religion and Intellectual Culture</a>" unit, where I examine how Islamic movements and Muslim intellectuals have navigated secular governance and shaped public discourse in Francophone West Africa since the 1960s. Through extensive fieldwork and archival research in Benin, Burkina Faso, Côte d'Ivoire, and Togo, I am investigating the intersection of Islamic activism, secularism and Muslim politics. I am paying particular attention to how educational institutions have served as key sites of religious mobilisation.</p>
            
            <p>My recent book, <em>Religious Activism on Campuses in Togo and Benin</em> <ItemReference id="religious-activism-campuses" />, explores how Christian and Muslim student associations emerged in the 1970s and profoundly reshaped university life in Lomé and Abomey-Calavi, challenging prevailing secular ideologies.</p>
            
            <p>A significant dimension of my work involves <a href="{base}/digital-humanities" data-sveltekit-preload-data>digital humanities</a> (DH) approaches. I am developing the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, an open-access database featuring over 13,500 items documenting Islam across the region. Using computational methods and artificial intelligence workflows, I analyse this vast corpus to uncover large-scale patterns in religious mobilisation, the evolution of Islamic discourse, the media's representation of Islam and the shifting relationships between Muslim communities and state authorities. Data visualisation techniques enable me to translate these computational findings into accessible narratives that reveal new aspects of Muslim public engagement.</p>
            
            <p>I am also the author of <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em> <ItemReference id="sphere-publique-musulmane" /> and co-editor of <em>Religiosity on University Campuses in Africa</em> <ItemReference id="religiosity-university-campuses" />. I have also co-edited two special journal issues: "Muslim Minorities in Africa, Part 1" <ItemReference id="muslim-minorities-africa-1" /> & "Part 2" <ItemReference id="muslim-minorities-africa-2" /> and "Les acteurs religieux africains à l'ère du numérique" <ItemReference id="acteurs-religieux-numerique" />. My <a href="{base}/publications" data-sveltekit-preload-data>research</a> has been published in eleven peer-reviewed journals and six edited volumes.</p>

            <p>Beyond academia, I apply this regional expertise as a consultant for <a href="https://communitology.co/" target="_blank" rel="noopener noreferrer">Communitology</a>, developing specialized Country of Origin Information (COI) reports for asylum and immigration cases involving Benin, Côte d'Ivoire, and Togo.</p>

            <p>I hold a Ph.D. with distinction in History from <a href="https://www.ulaval.ca/" target="_blank" rel="noopener noreferrer">Université Laval</a> and was previously a <a href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html" target="_blank" rel="noopener noreferrer">Banting Postdoctoral Fellow</a> at the <a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer">University of Florida</a>. Through my ongoing <a href="{base}/research">research</a> and <a href="{base}/digital-humanities">DH projects</a>, I explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>
        </div>
        
        <aside class="sidebar item-panel">
            <LatestActivities limit={3} />
        </aside>
    </div>
</div>
