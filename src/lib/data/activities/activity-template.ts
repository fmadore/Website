import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Activity Template - Copy this file and fill in the details
export const activityTemplate: Activity = {
	id: 'activity-template-id', // Replace with URL-friendly ID (use kebab-case)
	title: 'Activity Title',
	dateISO: 'YYYY-MM-DD', // Enter date in ISO format (e.g., 2025-03-21)
	date: formatDisplayDate('YYYY-MM-DD'), // This will be auto-formatted from dateISO
	year: 2025, // Enter the year
	description: 'Short description of the activity for list views (1-2 sentences).',
	content: `
        <p>First paragraph of detailed content about the activity. Describe the main aspects of the activity, 
        including what it involved, its significance, and your role in it.</p>
        
        <p>Second paragraph providing more details or context. You can add as many paragraphs as needed.</p>
        
        <p>Third paragraph, perhaps discussing outcomes, feedback, or future plans related to this activity.</p>
    `,
	tags: ['tag1', 'tag2', 'tag3'], // Add relevant tags for categorization
	url: '', // Optional: external URL if applicable
	additionalUrls: [
		{ label: 'Video Recording', url: 'https://example.com/video' },
		{ label: 'Presentation Slides', url: 'https://example.com/slides' },
		{ label: 'Event Website', url: 'https://example.com/event' }
	],
	image: '', // Optional: path to a small image (e.g., "images/activities/small-image.jpg")
	heroImage: {
		// Optional: hero image configuration
		src: 'images/activities/hero-image.jpg',
		alt: 'Descriptive alt text for the hero image',
		caption: 'Optional caption for the hero image'
	},
	pdfPath: '', // Optional: path to a PDF file (e.g., "pdfs/activities/my-activity.pdf")
	pdfTitle: '', // Optional: title for the PDF section (defaults to "Associated PDF Document")
	panelType: 'conference' // NEW: e.g., 'conference', 'workshop', 'lecture', 'event', 'publication', etc.
};
