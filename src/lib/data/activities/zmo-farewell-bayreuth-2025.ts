import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const zmoFarewellBayreuth2025: Activity = {
	id: 'zmo-farewell-bayreuth-2025',
	title: 'Farewell to ZMO and New Beginnings at the University of Bayreuth',
	dateISO: '2025-12-18',
	date: formatDisplayDate('2025-12-18'),
	year: 2025,
	description:
		'After five years at ZMO, I am moving to the Africa Multiple Cluster of Excellence at the University of Bayreuth as a data curator.',
	content: `
		<p>As an old German song goes: "Alles hat ein Ende, nur die Wurst hat zwei" (Everything has an end, only the sausage has two).</p>

		<p>Today marks the end of my five wonderful years at <a href="https://www.zmo.de/en" target="_blank" rel="noopener noreferrer">Leibniz-Zentrum Moderner Orient (ZMO)</a>. It has been a defining period for my career, shaped by an intellectually stimulating environment and colleagues who have made the centre a truly exceptional place, like a family.</p>

		<p>Although I cannot thank everyone individually, I would particularly like to express my gratitude to <a href="https://www.zmo.de/en/people/dr-abdoulaye-sounaye" target="_blank" rel="noopener noreferrer">Abdoulaye Sounaye</a> for bringing me on board for his <a href="https://remoboko.hypotheses.org/" target="_blank" rel="noopener noreferrer">"Religion, Morality and Boko in West Africa"</a> project, and to <a href="https://www.zmo.de/en/people/prof-dr-ulrike-freitag" target="_blank" rel="noopener noreferrer">Ulrike Freitag</a> and <a href="https://www.zmo.de/en/people/prof-dr-kai-kresse" target="_blank" rel="noopener noreferrer">Kai Kresse</a> for their continued support.</p>

		<p>In January, I will begin a new chapter at the <a href="https://www.africamultiple.uni-bayreuth.de/en/index.html" target="_blank" rel="noopener noreferrer">Cluster of Excellence Africa Multiple</a> at the University of Bayreuth. I am excited to join the <a href="https://www.africamultiple.uni-bayreuth.de/en/1_5-Digital-Solutions1/index.html" target="_blank" rel="noopener noreferrer">Digital Research Environment</a> team, led by <a href="https://www.dmwg.uni-bayreuth.de/en/team/mircoschoenfeld/index.html" target="_blank" rel="noopener noreferrer">Mirco Schönfeld</a>, as a Data Curator.</p>

		<p>In this role, I will bridge the gap between technical infrastructure and African Studies, supporting researchers in managing data according to FAIR and CARE principles, and ensuring that digital literacy and ethical standards are integrated into our workflows. This position will also allow me to continue my own research at the intersection of AI, digital humanities and African Studies.</p>
	`,
	heroImage: {
		src: 'images/activities/zmo-farewell-hero.webp',
		alt: 'The main entrance of the Leibniz-Zentrum Moderner Orient (ZMO) building in Berlin'
	},
	tags: ['career', 'ZMO', 'University of Bayreuth', 'Africa Multiple', 'digital humanities', 'data curation'],
	type: 'career',
	panelType: 'event'
};
