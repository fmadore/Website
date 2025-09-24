import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const archivesAlgorithmsIwac2025: Activity = {
	id: 'archives-algorithms-iwac-2025',
	title:
		'From Archives to Algorithms: Uncovering Transregional Islamic Connections through the Islam West Africa Collection (IWAC)',
	dateISO: '2025-09-11',
	date: formatDisplayDate('2025-09-11'),
	year: 2025,
	description: 'Paper presented at the Eighth European Congress on World and Global History',
	content: `
        <p>Findability ≠ significance. Co-mention ≠ connection.</p>
        
        <p>These cautions framed our panel, "Global and Transregional Histories: Digitally Connected?" at the Eighth European Congress on World and Global History in Växjö, Sweden. I presented "From Archives to Algorithms: Uncovering Transregional Islamic Connections through the <em>Islam West Africa Collection</em> (IWAC)". I am grateful to my panellists, Mila Oiva and Gerben Zaagsma, and to the organisers, Antje Dietze and Kathleen Schlütter, for facilitating such a stimulating conversation about the silences and biases inherent in digitised collections, and about the most effective ways to represent connections and their variations.</p>
        
        <p><strong>Key takeaways:</strong></p>
        <ul>
            <li><strong>From technologies to practices</strong>: Technological change has long shaped historical enquiry and the production of knowledge. Pay attention to when, where and how practices change, and to the technologies and individuals that influence them.</li>
            <li><strong>Digitisation reveals and flattens</strong>: decisions about selection, metadata and the unit of analysis determine what appears connected and what is obscured.</li>
            <li><strong>Silences are structured, not random</strong>: they arise from censorship; licensing and access regimes; OCR and language coverage; and national priorities.</li>
            <li><strong>Findability reflects supply-side bias</strong>: it mirrors what has been digitised and in which languages, not what is necessarily important.</li>
            <li><strong>Co-mentions are leads, not proof</strong>: qualify edges by type, strength and provenance, and make uncertainty explicit.</li>
            <li><strong>Connections are layered</strong>: social, infrastructural and semantic circuits rarely align.</li>
            <li><strong>Mix scales</strong>: use distant reading to map coverage and temporal patterns, and close reading to expose gaps and turn absence into evidence.</li>
        </ul>
    `,
	tags: [
		'Digital Humanities',
		'Global History',
		'Archives',
		'Algorithms',
		'Transregional History',
		'ENIUGH'
	],
	type: 'conference',
	heroImage: {
		src: 'images/activities/ENIUGH-hero.webp',
		alt: 'Photo of Frédérick Madore, Mila Oiva, Gerben Zaagsma, and Kathleen Schlütter at the European Congress on World and Global History'
	},
	panelType: 'conference'
};
