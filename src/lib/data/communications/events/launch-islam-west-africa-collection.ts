import type { Communication } from '$lib/types/communication';

export const launchIslamWestAfricaCollection: Communication = {
    id: "launch-islam-west-africa-collection", 
    title: "Launch of the Islam West Africa Collection",
    authors: ["Frédérick Madore"], 
    date: "9 November 2023", 
    dateISO: "2023-11-09", 
    year: 2023,
    conference: "Launch of the Islam West Africa Collection", 
    location: "Berlin", 
    country: "Germany", 
    type: "event", 
    language: "English", 
    abstract: "Launch event for the Islam West Africa Collection hosted by Media in Cooperation and Transition (MiCT) in Berlin.",
    tags: ["IWAC", "West Africa", "Collection", "Launch"], 
    url: "https://islam.zmo.de/s/westafrica/item/244", 
    image: "images/communications/poster-launch-IWAC.webp", 
    heroImage: {
        src: "images/communications/poster-launch-IWAC.jpg",
        alt: "Poster for the launch of the Islam West Africa Collection",
    },
    coordinates: {
        latitude: 52.53113443481993,
        longitude: 13.400499597613717
    },
    participants: [
        { name: "Frédérick Madore", role: "Speaker and Organizer", affiliation: "Leibniz-Zentrum Moderner Orient" },
        { name: "Ulrike Freitag", role: "Speaker", affiliation: "Leibniz-Zentrum Moderner Orient" },
        { name: "Mauro Nobili", role: "Speaker", affiliation: "University of Illinois at Urbana Champaign, USA" },
        { name: "Issouf Binaté", role: "Speaker", affiliation: "Université Alassane Ouattara, Côte d'Ivoire" },
        { name: "Kai Kresse", role: "Speaker", affiliation: "Leibniz-Zentrum Moderner Orient" }
    ],
    project: "Mining the Islam West Africa Collection" 
};

export default launchIslamWestAfricaCollection; 