<script lang="ts">
    import SEO from '$lib/SEO.svelte';
    import RelevantPublications from '$lib/components/organisms/RelevantPublications.svelte';
    import RelevantCommunications from '$lib/components/organisms/RelevantCommunications.svelte';
    import { base } from '$app/paths';
	import PageHeader from '$lib/components/common/PageHeader.svelte';
	import Breadcrumb from '$lib/components/molecules/Breadcrumb.svelte';
    import ItemReference from '$lib/components/common/ItemReference.svelte';
</script>

<SEO title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso | Frédérick Madore" />

<div class="container mx-auto px-4 py-8">
    <div class="grid">
        <div class="main-content">
            <Breadcrumb items={[
                { label: 'Research', href: '/research' },
                { label: 'Youth and Women\'s Islamic Activism in Côte d\'Ivoire and Burkina Faso', href: '' }
            ]} />
            
            <PageHeader 
                title="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" 
            />

            <div class="project-image">
                <img src="{base}/images/research/youth-women-activism.webp" alt="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" class="w-full h-auto" />
            </div>
            
            <div class="project-content">
                <p>This research project is situated in the context of the increasing visibility of Islam in the Ivorian and Burkinabe public sphere, particularly since the 1990s, and the growing engagement of youth and women within this religious dynamic. The project explores the emerging new forms of Islamic activism, with a particular focus on the role of young people and women, their communication strategies and their contribution to reshaping the religious and social landscape.</p>

                <p>An important focus of this research is the impact of the increasing mediatisation of Islam, both through traditional media (radio, periodicals) and new information and communication technologies (internet, social media). It analyses how these tools are used by religious actors, especially youth and women, to disseminate their discourse, assert their presence in the public sphere and negotiate social and religious norms. The project highlights the emergence of new mediatised religious figures, including women, who are gaining significant authority and visibility.</p>

                <p>The project also includes an in-depth study of the presence of Ivorian and Burkinabe Islam in the digital age. This analysis reveals how the internet and social media are being used by Islamic associations, Muslim intellectuals and individual religious figures to disseminate the religious message, construct transnational community identities and belonging, and promote new forms of online religiosity. The research highlights the challenges and limitations of this digital transition for some organisations, as well as the crucial role of individual initiatives, often led by young people, in harnessing the potential of the web.</p>

                <p>Another important strand of the project is concerned with intergenerational dynamics within Muslim communities. It analyses how the rise of a young Arabophone and Francophone elite, more familiar with new technologies, is challenging traditional forms of religious authority and seeking to position itself as the spokesperson for a 'civil Islam'. This research highlights the tensions and convergences between generations in the construction of contemporary Islam in Côte d'Ivoire and Burkina Faso.</p>

                <p>Specific themes explored in this project include the role of "francophone Muslim intellectuals" in the Burkinabe public sphere after the departure of President Blaise Compaoré (2014), the vitality and dynamism of Salafism in Côte d'Ivoire, and the organisation of the Hajj pilgrimage to Mecca in Côte d'Ivoire and the stakes involved. Special attention is also given to the emergence of influential female figures, such as Aminata Kane Koné <ItemReference id="muslim-feminist-media-cote-divoire-2020" />, and their role as religious entrepreneurs and media personalities.</p>

                <p>By combining qualitative research methods - notably interviews with Muslim actors, media content analysis (print media, websites, social media) and a socio-historical approach - this project contributes to a better understanding of the profound transformations taking place within Islam in West Africa, with a particular focus on the engagement and strategies of youth and women. It highlights the complexity of religious dynamics, the diversity of actors and discourses, and the socio-political stakes involved in the assertion of Islam in the Ivorian and Burkinabe contexts.</p>
            </div>
        </div>
        
        <div class="sidebar">
            <RelevantPublications projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" limit={5} />
            <div class="mt-6">
                <RelevantCommunications projectName="Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso" limit={5} />
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