import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Define the ISO date first
const activityDateISO = '2025-11-03';

export const ciramBookDiscussion2025: Activity = {
	id: 'ciram-book-discussion-religious-activism-2025',
	title: 'Présentation-discussion de l\'ouvrage "Religious Activism on Campuses in Togo and Benin"',
	dateISO: activityDateISO,
	date: formatDisplayDate(activityDateISO),
	year: 2025,
	description:
		'Book discussion hosted by the Centre interdisciplinaire de recherche sur l\'Afrique et le Moyen-Orient (CIRAM), Université Laval.',
	content: `
        <p>Delighted to join a discussion of my book, <em><a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noreferrer noopener">Religious Activism on Campuses in Togo and Benin</a></em>, hosted by the <a href="https://www.ciram.hei.ulaval.ca/" target="_blank" rel="noreferrer noopener">Centre interdisciplinaire de recherche sur l'Afrique et le Moyen-Orient (CIRAM)</a>, Université Laval.</p>
        
        <p>The session will open with Salia Dramé presenting his short documentary on the links between religion, precarity, and university life in Abidjan. I will then outline the book's main findings, followed by a discussion moderated by Issouf Binaté (Université Alassane Ouattara), with Muriel Gomez-Perez (Université Laval) and Cédric Jourde (University of Ottawa).</p>
        
        <p>The event will take place on Zoom. I hope to see you there!</p>
        
        <p><strong>📅 Date:</strong> November 6, 2025<br>
        <strong>⏰ Time:</strong> 12:00–1:30 p.m. EST (UTC−5)<br>
        <strong>💻 Format:</strong> Online (Zoom)<br>
        <strong>🔗 Registration:</strong> <a href="https://forms.gle/agWqJLs18daoiyaM9" target="_blank" rel="noreferrer noopener">https://forms.gle/agWqJLs18daoiyaM9</a></p>
    `,
	tags: ['Book Launch', 'CIRAM', 'Université Laval', 'Talk', 'Togo', 'Benin'],
	panelType: 'lecture',
    heroImage: {
		src: 'images/communications/ciram-2025-hero.webp',
		alt: "Poster for an online book talk with Frédérick Madore on “Religious Activism on Campuses in Togo and Benin”, 6 Nov 2025"
	},
	type: 'lecture',
	url: 'https://www.ciram.hei.ulaval.ca/activite/discussion-autour-du-livre-religious-activism-on-campuses-in-togo-and-benin/'
};
