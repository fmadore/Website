import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const zmoKitchenTalksPodcast2025: Activity = {
	id: 'zmo-kitchen-talks-podcast-2025',
	title: 'ZMO Kitchen Talks Podcast Recording',
	dateISO: '2025-11-21',
	date: formatDisplayDate('2025-11-21'),
	year: 2025,
	description: 'Conversation with Elisa Nobel-Dilaty for the Leibniz-Zentrum Moderner Orient "Kitchen Talks" podcast discussing the Islam in West Africa Collection and AI in African studies.',
	content: `
        <p>Had a great conversation today with Elisa Nobel-Dilaty for the Leibniz-Zentrum Moderner Orient (ZMO) "Kitchen Talks" podcast.</p>
        
        <p>We discussed my work on the Islam in West Africa Collection, as well as the potential and pitfalls of AI in African and Islamic studies, ranging from "vibe coding" and data extraction to the "seductive danger" of AI-driven OCR and HTR.</p>
        
        <p>Stay tuned for the release of the episode! In the meantime, here are a couple of photos from the recording.</p>
    `,
	tags: ['Podcast', 'AI', 'African Studies', 'Islamic Studies', 'Digital Humanities', 'ZMO'],
    image: 'images/communications/zmo-kitchen-talks-podcast-2025.webp',
		heroImage: {
		src: 'images/communications/zmo-kitchen-talks-podcast-2025.webp',
		alt: 'Frédérick Madore and Elisa Nobel-Dilaty sitting at a table with microphones and headphones in a recording studio for the ZMO Kitchen Talks podcast.'
	},
	type: 'podcast',
	panelType: 'media'
};
