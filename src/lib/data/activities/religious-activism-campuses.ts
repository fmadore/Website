import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = "2025-03-21";

export const religiousActivismCampuses: Activity = {
    id: "religious-activism-on-campuses-in-togo-and-benin",
    title: "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970-2023",
    dateISO: activityDateISO,
    date: formatDisplayDate(activityDateISO), // This will format to "21 March 2025"
    year: 2025,
    description: "New book publication based on research conducted at Leibniz-Zentrum Moderner Orient since 2021.",
    content: `
        <p>I'm delighted to announce the publication of my new book, <a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noopener noreferrer"><em>Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970-2023</em></a>, based on research conducted at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient</a> since 2021 as part of the project "<a href="https://www.zmo.de/en/research/mainresearchprogram/contested-religion/remoboko" target="_blank" rel="noopener noreferrer">Religion, Morality and Boko in West Africa: Students Training for a Good Life</a>" (Remoboko). It's taken a little longer than expected to complete, but I'm excited to finally share it with you. The book is in open access and the PDF can be downloaded for free.</p>
        
        <h2>Abstract</h2>
        
        <p>The interplay between religion and student activism at the universities of Abomey-Calavi (Benin) and Lomé (Togo) has often been overlooked, although faith-based organisations and student unions have coexisted since the 1970s. Based on interviews with different generations of activists, this book uncovers the neglected history of Christian and Muslim student associations on these campuses, originally strongholds of leftist and secular ideologies. It analyses the emergence of these groups under a Marxist-Leninist regime in Benin and a one-party dictatorship in Togo, and explores the implications of growing religiosity for these public universities as secular institutions.</p>
        
        <p>The history of these associations reveals the campus as a microcosm reflecting wider national socio-political life, while also highlighting the importance of translocal factors in shaping the internal dynamics of these groups. Amidst the massification of university enrolments and rising graduate unemployment, faith-based associations have come to provide more than religious guidance. Increasingly, they offer a "social curriculum", providing a space for socialisation and a set of skills, norms and moral values that complement the secular academic curriculum.</p>
    `,
    tags: ["Publication", "Remoboko", "Togo", "Benin"],
    panelType: "Publication",
    heroImage: {
        src: "images/De-Gruyter-ZMO.jpg",
        alt: "Book cover of Religious Activism on Campuses in Togo and Benin",
        caption: "Published March 2025 by De Gruyter"
    }
}; 