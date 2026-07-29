import type { Publication } from '$lib/types';

// Working Paper Template - Copy this file and fill in the details
// A working paper is a numbered instalment in an institutional series
// (e.g. "ZMO Programmatic Texts 16"), so `series` + `issue` carry the venue —
// not `journal`/`volume`.
export const workingPaperTemplate: Publication = {
	id: 'working-paper-template-id', // Replace with URL-friendly ID (use kebab-case)
	type: 'working-paper',
	title: 'Working Paper Title',
	authors: ['Author Name'], // Add all authors in the array
	date: '2025', // Publication year, or "Forthcoming" while unpublished
	dateISO: '2025-01', // Use YYYY-MM format when known
	year: 2025,
	series: 'Working Paper Series', // The numbered series this paper belongs to
	issue: '1', // Number within the series
	publisher: 'Issuing Institution', // Omit when identical to the series title
	publisherLocation: 'Country', // Country where the publisher is based (used for Publisher Locations map)
	placeOfPublication: '', // City of publication if applicable
	pageCount: 0, // Total number of pages
	language: 'English',
	doi: '10.0000/00000', // Add DOI when available
	abstract:
		"A description of the paper's argument, scope, and contribution. This abstract is used in list views and as a preview of the publication.",
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: 'https://example.org/working-paper', // URL to the publication
	image: '', // Optional: path to image (e.g., "images/publications/working-paper-image.webp")
	// New fields
	country: ['Country Name'], // Countries covered in the publication
	project: '' // Options: "Digital Humanities and AI in African Studies", "Religious Activism on Campuses in Togo and Benin", "Muslim Minorities in Southern Cities of Benin and Togo", "Youth and Women's Islamic Activism in Côte d'Ivoire and Burkina Faso", "Digital Research Environment (University of Bayreuth)", "Other"
};
