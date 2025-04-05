import type { Activity } from '\$lib/types';
import { formatDisplayDate } from '\$lib/utils/date-formatter';
import { base } from '$app/paths'; // Import base path

export const activity: Activity = {
    id: "tracing-islamic-knowledge-production",
    title: "Tracing Islamic Knowledge Production in Francophone West African Newspapers (1990-Present)",
    dateISO: "2024-12-02",
    date: formatDisplayDate("2024-12-02"),
    year: 2024,
    description: "Presented findings on Islamic knowledge production in Francophone West Africa at the ZMO workshop \"Perspectives in Motion: Conceptual Fields from the Global South\". Examined how Muslim intellectuals navigate multiple epistemologies using a corpus of 1,500 Islamic periodicals.",
    content: `
        <p>At the workshop “Perspectives in Motion: Conceptual Fields from the Global South” hosted by ZMO, I presented findings from my research on Islamic knowledge production in Francophone West Africa. Drawing on a corpus of 1,500 Islamic periodicals from Benin, Burkina Faso, Côte d'Ivoire and Togo, my presentation <a href="${base}/communications/tracing-islamic-knowledge-production">“Tracing Islamic Knowledge Production in Francophone West African Newspapers (1990-Present)”</a> examined how Western-educated Muslim intellectuals navigate multiple epistemological traditions to create new theoretical frameworks.</p>
        
        <h2>Abstract</h2>
        <p>This paper examines how Francophone Muslim intellectuals in West Africa develop autonomous conceptual fields through Islamic publications. Drawing on a corpus of 1,500 Islamic periodicals from Benin, Burkina Faso, Côte d'Ivoire, and Togo (1990-present), we analyse how Western-educated Muslim writers navigate multiple epistemological traditions to generate new theoretical frameworks that transcend simple categorisations as 'Western', 'African' or traditionally 'Islamic.'</p>
        
        <p>The concept of '<em>intégrisme</em>' (integrism), originally used to describe Catholic fundamentalism, illustrates this complex dynamic. In the 1990s, while state authorities and Western-educated Christian elites often weaponised the term to stir up fears of 'Muslim integrism' and 'fundamentalism' by drawing parallels with the Algerian civil war, Francophone Muslim intellectuals developed sophisticated counter-narratives. Their writings show how they navigated between Western-derived secular discourses, Islamic theological concepts and local African political frameworks to produce new understandings of religious commitment and political engagement.</p>
        
        <p>Using computational methods such as topic modelling and word embeddings, combined with close reading, we extend this analysis to trace broader conceptual transformations in Francophone Islamic discourse. We examine how concepts such as <em>laïcité</em> and democracy are reinterpreted by Muslim intellectuals, who draw on both their Western secular education and Islamic knowledge to develop hybrid interpretive frameworks. Similarly, concepts such as ummah, Islamism, jihadism, Wahhabism and <em>bid'ah</em> take on new meanings as they are reframed through this dual intellectual heritage and local context. These semantic shifts reveal complex processes of conceptual translation and adaptation resulting from the authors' ability to navigate multiple epistemological traditions, challenging both Western secular frameworks and traditional religious authorities.</p>
        
        <p>The study also maps South-South knowledge circulation networks between West African countries, the Arab-Islamic world, and other Muslim communities in the Francophone world. By examining how writers engage with multiple centres of Islamic thought – from Al-Azhar and France to local institutions – we show how these media outlets create autonomous spaces for intellectual exchange and conceptual development.</p>

        <p>This research contributes to the understanding of 'concepts, theories, philosophies, and theologies are produced in the postcolonial world' by providing empirical evidence of how francophone Muslim intellectuals in West Africa create new conceptual fields that engage with, but are not determined by, hegemonic frameworks. It shows how religious discourse can contribute to decolonial knowledge production by offering alternative epistemological systems.</p>
    `,
    tags: ["Workshop", "Digital Humanities", "Côte d'Ivoire"],
    image: "",
    heroImage: {
        src: "images/activities/tracing-islamic-knowledge-production.png",
        alt: "",
        caption: ""
    },
    pdfPath: "files/perspectives-in-motion-programme.pdf", 
    pdfTitle: "Workshop programme"
}; 