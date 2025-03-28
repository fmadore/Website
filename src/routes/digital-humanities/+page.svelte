<script>
    import SEO from '$lib/SEO.svelte';
    import { base } from '$app/paths';
</script>

<SEO title="Digital Humanities" description="Discover Frédérick Madore's digital humanities projects including the Islam West Africa Collection (IWAC) and Islam Burkina Faso Collection." />

<div class="container">
    <h1>Digital Humanities</h1>

    <section class="project">
        <h2><em>Islam West Africa Collection</em> (2023-)</h2>

        <p>With the support of Leibniz-Zentrum Moderner Orient (ZMO) and funding from the Berlin Senate Department for Science, Health and Care, I'm currently working on the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> (IWAC), which currently contains over 12,500 archival documents, newspaper articles, Islamic publications of various kinds, audio and video recordings, and photographs on Islam and Muslims in Burkina Faso, Benin, Niger, Nigeria, Togo and Côte d'Ivoire. Most documents are in French, but some are also in Hausa, Arabic, Dendi, Fon and English. The site also indexes over 850 references to relevant books, book chapters, book reviews, journal articles, dissertations, theses, reports and blog posts.</p>
    </section>

    <hr>

    <section class="project">
        <h2><em>Islam Burkina Faso Collection</em> (2018-23)</h2>

        <p>Launched in 2021, the <a href="https://ufdc.ufl.edu/collections/ibfc" target="_blank" rel="noopener noreferrer"><em>Islam Burkina Faso Collection</em></a> is an open access digital database containing over 2,900 archival documents, newspaper articles, Islamic publications of various forms, and photographs on Islam and Muslims in Burkina Faso. The site also indexes more than 275 bibliographical references of books, book chapters, journal articles, dissertations and theses on the topic. In addition to the metadata attribution, optical character recognition (OCR) has also been applied to each document. An index of nearly 1000 events, locations, organizations, people, and topics is also available.</p>
        
        <p>This project is one of the first digital humanities initiatives to be published under a new University of Florida Libraries program, LibraryPress@UF. This program, an imprint of the Libraries and the University of Florida Press, seeks to develop public scholarship across formats that extend and complement the work of traditional academic publishing.</p>

        <p>To learn more about this project, see Frédérick Madore, "<a href="https://doi.org/10.51185/journals/rhca.2021.e610" target="_blank" rel="noopener noreferrer">La <em>Collection Islam Burkina Faso</em> : promesses et défis des humanités numériques</a>". <em>Revue d'Histoire Contemporaine de l'Afrique</em> (2021). DOI 10.51185/journals/rhca.2021.e610</p>

        <h3>Award</h3>

        <p>I won a <em>2023 Emerging Open Scholarship Award</em>, sponsored by the Canadian Social Knowledge Institute (C-SKI) and its partners, for my work on the <em>Islam Burkina Faso Collection</em>.</p>

        <h3>Reviews</h3>

        <p>Robert Launay, "<a href="https://doi.org/10.21428/3e88f64f.89e71c81" target="_blank" rel="noopener noreferrer">Review: Islam Burkina Faso Collection</a>", <em>Reviews in Digital Humanities</em> 4, no. 4 (2023). DOI 10.21428/3e88f64f.89e71c81</p>

        <blockquote>
            "The collection is an invaluable research tool for scholars in or outside Burkina Faso, offering access to material that is difficult or impossible to find outside — and sometimes even inside — the country [...] The collection is an extremely important contribution and critical aid to scholarship on Islam in West Africa."
        </blockquote>

        <p>Vincent Hiribarren, "<a href="https://doi.org/10.2979/mnd.2022.a908483" target="_blank" rel="noopener noreferrer">Review of Frédérick Madore 'Islam Burkina Faso Collection'</a>", <em>Mande Studies</em> 24 (2022): 325–27. DOI 10.2979/mnd.2022.a908483</p>

        <blockquote>
            "Obviously, this is an impressive achievement, and the project launched in 2021 by Frédérick Madore will become an increasingly useful repository since travel in and to Burkina Faso has become more difficult. [...] What the interface also clearly offers is a potential re-interpretation of the documents used by Madore and new possible enquiries for students and professional researchers. The two exhibitions available on the website demonstrate the potential of such an approach and the way the database can also become part of our teaching. [...] the Islam Burkina Faso Collection is already a fascinating resource with a significant potential for future researchers."
        </blockquote>
    </section>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 var(--spacing-4);
    }

    h1 {
        font-size: var(--font-size-3xl);
        color: var(--color-primary);
        margin-bottom: var(--spacing-8);
    }

    h2 {
        font-size: var(--font-size-2xl);
        margin-top: var(--spacing-8);
        margin-bottom: var(--spacing-4);
        color: var(--color-primary);
    }

    h3 {
        font-size: var(--font-size-xl);
        margin-top: var(--spacing-6);
        margin-bottom: var(--spacing-2);
        color: var(--color-primary-dark);
    }

    .project {
        margin-bottom: var(--spacing-8);
    }

    p {
        margin-bottom: var(--spacing-4);
        line-height: 1.7;
    }

    blockquote {
        border-left: 4px solid var(--color-gray-300);
        padding-left: var(--spacing-4);
        margin-left: var(--spacing-4);
        margin-bottom: var(--spacing-4);
        color: var(--color-text-secondary);
        font-style: italic;
    }

    hr {
        margin: var(--spacing-8) 0;
        border: 0;
        height: 1px;
        background-color: var(--color-border);
    }

    a {
        color: var(--color-primary);
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }
</style> 