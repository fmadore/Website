import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const islamBurkinaFasoCollection: DigitalHumanitiesProject = {
    id: "islam-burkina-faso-collection",
    title: "Islam Burkina Faso Collection",
    years: "2018-2023",
    shortDescription: "An open access digital database containing over 2,900 documents on Islam and Muslims in Burkina Faso, now archived within IWAC.",
    description: "<p>Launched in 2021, the <em>Islam Burkina Faso Collection</em> is an open access digital database containing over 2,900 archival documents, newspaper articles, Islamic publications of various forms, and photographs on Islam and Muslims in Burkina Faso. The site also indexes more than 275 bibliographical references of books, book chapters, journal articles, dissertations and theses on the topic. In addition to the metadata attribution, optical character recognition (OCR) has also been applied to each document. An index of nearly 1000 events, locations, organizations, people, and topics is also available.</p><p>This project is one of the first digital humanities initiatives to be published under a new University of Florida Libraries program, LibraryPress@UF. This program, an imprint of the Libraries and the University of Florida Press, seeks to develop public scholarship across formats that extend and complement the work of traditional academic publishing.</p><p>Please note: The <em>Islam Burkina Faso Collection</em> served as a foundational project and has now been archived. Its materials have been integrated into the larger <a href=\"https://islam.zmo.de/s/westafrica/\" target=\"_blank\" rel=\"noopener noreferrer\"><em>Islam West Africa Collection (IWAC)</em></a>, which continues to grow and provide access to these valuable resources.</p>",
    imageUrl: `/images/digital-humanities/islam-burkinafaso-banner.webp`,
    award: "I won a <a href='https://etcl.uvic.ca/2023/01/17/2023-open-scholarship-awards/' target='_blank' rel='noopener noreferrer'>2023 Emerging Open Scholarship Award</a>, sponsored by the <a href='https://c-ski.ca/' target='_blank' rel='noopener noreferrer'>Canadian Social Knowledge Institute (C-SKI)</a> and its partners, for my work on the Islam Burkina Faso Collection.",
    reviews: [
        {
            text: "Robert Launay, \"Review: Islam Burkina Faso Collection\", <em>Reviews in Digital Humanities</em> 4, no. 4 (2023).", 
            url: "https://doi.org/10.21428/3e88f64f.89e71c81",
            quote: "The collection is an invaluable research tool for scholars in or outside Burkina Faso, offering access to material that is difficult or impossible to find outside — and sometimes even inside — the country [...] The collection is an extremely important contribution and critical aid to scholarship on Islam in West Africa."
        },
        {
            text: "Vincent Hiribarren, \"Review of Frédérick Madore 'Islam Burkina Faso Collection'\", <em>Mande Studies</em> 24 (2022): 325-27.", 
            url: "https://doi.org/10.2979/mnd.2022.a908483",
            quote: "Obviously, this is an impressive achievement, and the project launched in 2021 by Frédérick Madore will become an increasingly useful repository since travel in and to Burkina Faso has become more difficult. [...] What the interface also clearly offers is a potential re-interpretation of the documents used by Madore and new possible enquiries for students and professional researchers. The two exhibitions available on the website demonstrate the potential of such an approach and the way the database can also become part of our teaching. [...] the Islam Burkina Faso Collection is already a fascinating resource with a significant potential for future researchers."
        }
    ],
    publication: { text: "To learn more about this project, see Frédérick Madore, \"La Collection Islam Burkina Faso : promesses et défis des humanités numériques\". <em>Revue d'Histoire Contemporaine de l'Afrique</em> 2021.", url: "https://doi.org/10.51185/journals/rhca.2021.e610" },
    order: 11,
    skills: ["Omeka S", "Tesseract", "Metadata Standards", "OpenRefine", "Zotero", "Linked Data"]
}; 