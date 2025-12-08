import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const buildingAiPipelinesAfricanDigitalCollections: Activity = {
	id: 'building-ai-pipelines-african-digital-collections',
	title: 'Building AI Pipelines for African Digital Collections: Lessons from the Islam West Africa Collection',
	dateISO: '2025-12-05',
	date: formatDisplayDate('2025-12-05'),
	year: 2025,
	description: 'Presentation to the ALMEDA team on AI pipelines for managing large-scale African digital collections.',
	content: `
        <p>How do you make 26 million words of West African history searchable?</p>

        <p>The <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam West Africa Collection</em></a> spans six countries and comprises over 14,500 documents. Managing this digital database involves grappling with scale.</p>

        <p>I recently discussed this challenge with the <a href="https://almedaresearch.org/" target="_blank" rel="noopener noreferrer">African Literary Metadata (ALMEDA)</a> team at Uppsala University, at the invitation of <a href="https://www.uu.se/en/contact-and-organisation/staff?query=N7-1606" target="_blank" rel="noopener noreferrer">Ashleigh Harris</a>. In my talk, "Building AI Pipelines for African Digital Collections: Lessons from the Islam West Africa Collection", I mapped out four specific workflows that I have developed to manage this volume of data:</p>

        <ol>
            <li><strong>OCR correction:</strong> Cleansing "noisy" text from newspaper scans to improve readability.</li>
            <li><strong>Text extraction:</strong> Deploying multimodal AI to interpret complex magazine layouts and handwritten notes.</li>
            <li><strong>Named Entity Recognition (NER):</strong> Automating metadata to locate specific people, places, and organisations.</li>
            <li><strong>Indexing:</strong> Building rich, searchable indices that open up entire publications to researchers.</li>
        </ol>

        <p>We also raised a critical point: technology must not become a barrier. In order to meaningfully support African libraries, we must prioritise "minimal computing" and "digital sobriety". These approaches ensure that metadata workflows remain cost-effective and open source, rather than locking institutions into expensive, unmaintainable systems.</p>

        <p>We also addressed the messy reality of the archive. Dealing with unstructured data, mixed languages, and irregular layouts requires tools that are not just powerful, but pragmatic.</p>
    `,
	tags: ['AI', 'Digital Humanities', 'African Studies', 'IWAC', 'ALMEDA', 'Talk'],
	type: 'lecture',
	panelType: 'lecture',
	heroImage: {
		src: 'images/activities/uppsala-2025-hero.webp',
		alt: 'Frédérick Madore presenting to the ALMEDA team at Uppsala University around a conference table with laptops and a screen displaying research data'
	},
};
