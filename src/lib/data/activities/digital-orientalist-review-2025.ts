import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'digital-orientalist-review-2025',
	title: 'Anaïs Wion reviews the Islam West Africa Collection in The Digital Orientalist',
	dateISO: '2025-09-23',
	date: formatDisplayDate('2025-09-23'),
	year: 2025,
	description:
		'Anaïs Wion\'s review of the Islam West Africa Collection published in The Digital Orientalist.',
	content: `
        <p>Honoured to see Anaïs Wion's review of the Islam West Africa Collection published in <a href="https://digitalorientalist.com/2025/09/23/islam-west-africa-collection-dataset-distant-reading-and-uses-of-ai-for-discourse-analysis/" target="_blank" rel="noreferrer noopener">The Digital Orientalist</a>.</p>
        
        <p>This recognition comes at a fitting moment, as the website has recently undergone a major visual update and new content exploring digital humanities and AI has been added.</p>
            `,
	tags: ['Digital Humanities', 'IWAC', 'Review'],
	panelType: 'publication',
	image: 'images/activities/The-Digital-Orientalist.webp',
	heroImage: {
		src: 'images/activities/The-Digital-Orientalist-hero.webp',
		alt: 'The Digital Orientalist review of the Islam West Africa Collection'
	},
	type: 'publication'
};