import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const zmoKitchenTalksPodcast2025: Activity = {
	id: 'zmo-kitchen-talks-podcast-2025',
	title: 'ZMO Kitchen Talks Podcast Recording',
	dateISO: '2025-11-21',
	date: formatDisplayDate('2025-11-21'),
	year: 2025,
	description: 'Joined Elisa Nobel-Dilaty on the ZMO "Kitchen Talks" podcast to discuss the Islam in West Africa Collection and potential and pitfalls of AI in African and Islamic studies.',
	content: `
        <p>Had a great conversation with Elisa Nobel-Dilaty for the Leibniz-Zentrum Moderner Orient (ZMO) <a href="https://www.zmo.de/en/kitchen-talks" target="_blank" rel="noopener noreferrer">Kitchen Talks</a> podcast.</p>
        
        <p>We discussed my work on the <a href="https://islam.zmo.de/s/westafrica/" target="_blank" rel="noopener noreferrer"><em>Islam in West Africa Collection</em></a>, as well as the potential and pitfalls of AI in African and Islamic studies, ranging from "vibe coding" and data extraction to the "seductive danger" of AI-driven OCR and HTR.</p>
        
        <p>The episode is now available! Listen on:</p>
        <ul>
            <li><a href="https://open.spotify.com/episode/3zScd0lM8ecPYnlV8wInDu" target="_blank" rel="noopener noreferrer">Spotify</a></li>
            <li><a href="https://podcasts.apple.com/us/podcast/artificial-intelligence-ai-in-african-and-islamic-studies/id1854423734?i=1000740827248" target="_blank" rel="noopener noreferrer">Apple Podcasts</a></li>
            <li><a href="https://zmo-kitchen-talks.podigee.io/14-neue-episode" target="_blank" rel="noopener noreferrer">Podigee</a></li>
            <li><a href="https://pca.st/episode/dd8e2cc4-a1e4-4121-8b0b-2bdbf7e714d7" target="_blank" rel="noopener noreferrer">Pocket Casts</a></li>
            <li><a href="https://link.deezer.com/s/31RQUHFM3mhYI88kbzEW9" target="_blank" rel="noopener noreferrer">Deezer</a></li>
        </ul>
    `,
	tags: ['Podcast', 'AI', 'African Studies', 'Islamic Studies', 'Digital Humanities', 'ZMO', 'IWAC'],
    image: 'images/communications/zmo-kitchen-talks-podcast-2025.webp',
		heroImage: {
		src: 'images/communications/zmo-kitchen-talks-podcast-2025.webp',
		alt: 'Frédérick Madore and Elisa Nobel-Dilaty sitting at a table with microphones and headphones in a recording studio for the ZMO Kitchen Talks podcast.'
	},
	type: 'podcast',
	panelType: 'media'
};
