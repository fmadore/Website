import type { Communication } from '$lib/types/communication';

export const ecas2025Panel: Communication = {
    id: "dh-ai-african-studies-2025",
    title: "Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives",
    authors: ["Frédérick Madore", "Vincent Hiribarren"],
    date: "25 June 2025",
    dateISO: "2025-06-25", // Approximate date in June
    year: 2025,
    conference: "10th European Conference of African Studies (ECAS)",
    location: "Prague",
    country: "Czech Republic",
    type: "panel",
    language: "English",
    abstract: "This panel explores the transformative potential and challenges of DH and AI in African studies. It examines their impact on knowledge production and dissemination, addressing Anglocentricity and the 'digital divide', while promoting dialogue on decolonising digital practices in the field.",
    tags: ["ECAS", "digital humanities", "AI", "african studies", "decolonial"],
    coordinates: {
        latitude: 50.08896481219099,
        longitude: 14.416024062407818
    },
    papers: [
        {
            title: "Linking African Cultural Metadata for Visibility, Searchability, and Sustainability: the African Literary Metadata (ALMEDA) project",
            authors: ["Harris Ashleigh"],
            abstract: "The ALMEDA project is comprised of three interrelated work packages: the first investigates the history of literary metadata on the African continent in order to understand how colonial cataloguing systems came to construct the idea of the ‘literary work’ as book-based and thus dismissive of Africa’s oral cultures. Secondly, and as a corrective to this history, ALMEDA is developing a metadata ontology specifically designed for African genres in African languages. Not only does this knowledge structure enable data entry and searchability in multiple languages, but it also involves a unique descriptive model that allows African-language genres to inhabit their own categories, rather than having to be forced into European literary ontologies. Thirdly, the project is creating a linked open metadata repository, run as a Wikibase instance, which will – when launched – be the means through which users can search for and enter data. In this presentation of the project, I aim to show some of the challenges and potentials we face in the area of African Studies when working with Linked Open Data and to present ALMEDA’s emerging methods of addressing those problems. The project seeks feedback from as wide a range of stakeholders and Africanists as possible, and the paper encourages feedback on our ontology and our tentative resolutions to the challenges of addressing multilingual needs in a database of this scale."
        }
    ],
    participants: [
        {
            name: "Frédérick Madore",
            role: "Chair",
            affiliation: "Leibniz-Zentrum Moderner Orient"
        },
        {
            name: "Vincent Hiribarren",
            role: "Chair",
            affiliation: "King's College London"
        }
    ],
    project: "Mining the Islam West Africa Collection"
}; 