<script lang="ts">
    import LatestActivities from '$lib/components/organisms/LatestActivities.svelte';
    import SEO from '$lib/SEO.svelte';
    import { activitiesByYear } from '$lib/data/activities';
    import { base } from '$app/paths';
    import ItemReference from '$lib/components/molecules/ItemReference.svelte';
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { PageData } from './$types';
    import Icon from '@iconify/svelte';

    export let data: PageData;
    $: jsonLdString = data.jsonLdString;

    const jsonLdScriptId = 'person-json-ld';

    onMount(() => {
        if (browser && jsonLdString) {
            if (document.getElementById(jsonLdScriptId)) return;
            const script = document.createElement('script');
            script.id = jsonLdScriptId;
            script.type = 'application/ld+json';
            script.textContent = jsonLdString;
            document.head.appendChild(script);
        }
    });

    onDestroy(() => {
        if (browser) {
            const script = document.getElementById(jsonLdScriptId);
            if (script) document.head.removeChild(script);
        }
    });

    // Years with content - dynamically created from activities data
    const years = Object.entries(activitiesByYear).map(([year, activities]) => ({
        year: parseInt(year),
        count: activities.length
    })).sort((a, b) => b.year - a.year);
</script>

<SEO />

<div class="profile-container">
    <div class="profile-header enhanced-header">
        <div class="profile-photo">
            <img src="{base}/images/Profile-picture.jpg" alt="Frédérick Madore" class="rounded-full">
        </div>
        <div class="profile-title">
            <h1>About</h1>
            <div class="subtitle">Research Fellow at Leibniz-Zentrum Moderner Orient (ZMO)</div>
            <div class="profile-icons">
                <a href="mailto:frederick.madore@zmo.de" target="_blank" rel="noopener" aria-label="Email">
                    <Icon icon="mdi:email" width="28" height="28" />
                </a>
                <a href="https://scholar.google.com/citations?user=naUK0RQAAAAJ" target="_blank" rel="noopener" aria-label="Google Scholar">
                    <Icon icon="academicons:google-scholar" width="28" height="28" />
                </a>
                <a href="https://github.com/fmadore" target="_blank" rel="noopener" aria-label="GitHub">
                    <Icon icon="mdi:github" width="28" height="28" />
                </a>
                <a href="https://www.linkedin.com/in/frederickmadore" target="_blank" rel="noopener" aria-label="LinkedIn">
                    <Icon icon="mdi:linkedin" width="28" height="28" />
                </a>
                <a href="https://orcid.org/0000-0003-0959-2092" target="_blank" rel="noopener" aria-label="ORCID">
                    <Icon icon="mdi:orcid" width="28" height="28" />
                </a>
            </div>
        </div>
    </div>

    <div class="profile-content">
        <div class="main-content main-content-card">
            <p>I am a Research Fellow at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a> in the "<a href="https://www.zmo.de/en/research/religion-and-intellectual-culture" target="_blank" rel="noopener noreferrer">Religion and Intellectual Culture</a>" unit. My <a href="{base}/research">research</a> focuses on the history of Islam and Muslim societies in francophone West Africa since the 1960s. I have conducted extensive fieldwork and archival research in Benin, Togo, Côte d'Ivoire, and Burkina Faso, examining Islamic activism, secularism, and Muslim politics.</p>
            
            <p>My recent book, <em>Religious Activism on Campuses in Togo and Benin</em> <ItemReference id="religious-activism-campuses" />, explores how Christian and Muslim student associations emerged in the 1970s and profoundly reshaped university life in Lomé and Abomey-Calavi, challenging prevailing secular ideologies.</p>
            
            <p>A significant part of my work involves <a href="{base}/digital-humanities">digital humanities</a> (DH). I lead the development of the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, an open-access database featuring over 13,500 items on Islam across the region. Using artificial intelligence and machine learning, I analyse this vast corpus to uncover large-scale trends and patterns in Muslim public life. I use data visualisation techniques to translate these findings into compelling narratives, making the insights accessible and engaging. This holistic approach complements traditional historical analysis and brings new perspectives through computational techniques.</p>
            
            <p>I am also the author of <em>La construction d'une sphère publique musulmane en Afrique de l'Ouest</em> <ItemReference id="sphere-publique-musulmane" /> and co-editor of <em>Religiosity on University Campuses in Africa</em> <ItemReference id="religiosity-university-campuses" />. I have also co-edited two special journal issues: "Muslim Minorities in Africa, Part 1" <ItemReference id="muslim-minorities-africa-1" /> & "Part 2" <ItemReference id="muslim-minorities-africa-2" /> and "Les acteurs religieux africains à l'ère du numérique" <ItemReference id="acteurs-religieux-numerique" />. My <a href="{base}/publications">research</a> has been published in eleven peer-reviewed journals and six edited volumes.</p>
                        
            <p>Beyond academia, I apply my regional knowledge as a consultant for <a href="https://communitology.co/" target="_blank" rel="noopener noreferrer">Communitology</a>, developing specialized Country of Origin Information (COI) reports for asylum and immigration cases involving Benin, Togo, and Côte d'Ivoire.</p>
            
            <p>I hold a Ph.D. with distinction in History from <a href="https://www.ulaval.ca/" target="_blank" rel="noopener noreferrer">Université Laval</a> and was previously a <a href="https://banting.fellowships-bourses.gc.ca/en/home-accueil.html" target="_blank" rel="noopener noreferrer">Banting Postdoctoral Fellow</a> at the <a href="https://www.ufl.edu/" target="_blank" rel="noopener noreferrer">University of Florida</a>. Through my ongoing <a href="{base}/research">research</a> and <a href="{base}/digital-humanities">DH projects</a>, I continue to explore new approaches to understanding the dynamics of Muslim societies in Francophone West Africa, combining traditional historical methods with innovative computational techniques.</p>
        </div>
        
        <aside class="sidebar sidebar-card">
            <LatestActivities limit={3} />
        </aside>
    </div>
</div>
