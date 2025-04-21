import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
    id: "dh-ai-african-studies-ecas-panel",
    title: "Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives",
    dateISO: "2024-10-14",
    date: formatDisplayDate("2024-10-14"),
    year: 2024,
    description: "Announcing the acceptance of the panel proposal 'Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives' for ECAS 2025 in Prague.",
    content: `
        <p>I am pleased to announce that the panel proposal "Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives" submitted by Vincent Hiribarren and myself has been accepted for the 10th European Conference on African Studies (ECAS). The conference will be held in Prague in June 2025.</p>
        <p>Further details on the call for papers and the submission process will be announced soon. In the meantime, please contact us if you are interested in submitting a proposal for this panel.</p>
        <h3>Abstract</h3>
        <p>As the "digital turn" in African studies gains momentum, this panel explores the transformative potential and critical challenges of digital humanities (DH) and artificial intelligence (AI) in the field. We examine their impact on the production, dissemination, and interpretation of knowledge about Africa, addressing the persistent Anglocentricity and "digital divide".</p>
        <p>We invite papers that present innovative applications of computational methods in African studies and/or critical reflections on decolonising DH practices. Topics may include:</p>
        <ol>
            <li><strong>Methodological innovations:</strong> Digital approaches to exploring African, Afropolitan, and Afropean belongings through textual and visual analysis; AI-driven analysis of digitised African content (e.g., natural language processing, named entity recognition); Teaching African history with digital tools</li>
            <li><strong>Critical perspectives:</strong> Decolonising DH methodologies and epistemologies; Addressing "digital imperialism" (Breckenridge 2014) and the "digital saviour complex" (Shringarpure 2020) in relation to positionality and knowledge construction; Ethical considerations in applying DH methods to culturally sensitive contexts</li>
            <li><strong>Knowledge production and dissemination:</strong> Digital platforms for alternative knowledge production and public scholarship centred on African perspectives; Strategies for overcoming selective digitisation and colonial hierarchies in digital archiving; Transnational and cross-continental collaborative digital projects that challenge established Global North paradigms</li>
        </ol>
        <p>The panel aims to showcase cutting-edge transdisciplinary research that uses digital methods to explore the complexities of African realities, identities, and knowledge systems. By fostering dialogue on the potential and pitfalls of digital approaches, we aim to contribute to a more inclusive, diverse, and critically aware digital landscape in African studies.</p>
    `,
    tags: ["ECAS", "Digital Humanities", "AI", "African Studies"],
    image: "",
    panelType: "Conference",
    heroImage: {
        src: "images/activities/ECAS-2025.webp",
        alt: "",
        caption: ""
    }}; 