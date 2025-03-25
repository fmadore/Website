import type { Publication } from '$lib/types';

export const muslimMinoritiesAfrica: Publication = {
    id: "muslim-minorities-africa",
    type: "special-issue",
    title: "Muslim Minorities in Africa, Part 1 & Part 2",
    authors: ["Frédérick Madore", "Dorothea Schulz"],
    editors: "Frédérick Madore and Dorothea Schulz",
    date: "2021-2022",
    dateISO: "2021-07", // Using the earliest part's date for sorting
    year: 2021, // Using the earliest year
    journal: "Islamic Africa",
    volume: "12 / 13",
    issue: "2/1",
    language: "English",
    publisher: "Brill",
    tags: ["Islam", "Africa", "religious minorities", "Muslim communities", "interfaith relations", "special issue", "religious coexistence"],
    url: "https://brill.com/view/journals/iafr/12/2/iafr.12.issue-2.xml",
    image: "images/publications/muslim-minorities-africa.jpg",
    heroImage: {
        src: "images/publications/muslim-minorities-africa-hero.jpg",
        alt: "Cover of the special issue on Muslim Minorities in Africa",
        caption: "Special issue of Islamic Africa on Muslim Minorities in Africa"
    },
    isEditedWork: true,
    additionalUrls: [
        { 
            label: "Part 2",
            url: "https://brill.com/view/journals/iafr/13/1/iafr.13.issue-1.xml"
        }
    ]
}; 