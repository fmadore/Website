import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

// Grant announcement and upcoming workshop
export const activity: Activity = {
	id: 'volkswagenstiftung-dh-ai-african-studies-workshop-2026',
	title:
		'VolkswagenStiftung grant for “Charting New Territory: Digital Humanities and AI in African Studies”',
	dateISO: '2025-08-11',
	date: formatDisplayDate('2025-08-11'),
	year: 2025,
	description:
		'With Vincent Hiribarren, I received funding from the VolkswagenStiftung to organise a scoping workshop (18-20 Feb 2026, Herrenhausen Palace, Hanover) on DH and AI in African Studies.',
	content: `
  <p>I'm delighted to share that <a href="https://www.vincenthiribarren.com/" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I have received generous funding from the <strong>VolkswagenStiftung</strong> to organise <em>"Charting New Territory: Digital Humanities and AI in African Studies"</em>, a <a href="https://www.volkswagenstiftung.de/en/funding/funding-offer/scoping-workshops" target="_blank" rel="noopener noreferrer">scoping workshop</a> which will take place from <strong>18 to 20 February 2026</strong> at the Conference Centre in Herrenhausen Palace, Hanover.</p>

    <p>Around thirty colleagues from Africa, Europe and North America will come together for three days of structured dialogue and practical planning. The focus will be on collaboration and strategy rather than formal talks.</p>

    <p>We will focus on three practical questions:</p>
    <ul>
      <li><strong>How should DH and AI evolve within African Studies?</strong></li>
      <li><strong>What academic conditions and infrastructures are needed?</strong></li>
      <li><strong>How do we move from intentions around equity and decolonisation to concrete changes in practice?</strong></li>
    </ul>

    <p>Instead of giving presentations, participants will work together to write a <strong>position paper</strong> containing actionable recommendations for research funders, universities, technology developers, and policymakers. The aim is to promote the ethical and equitable advancement of DH and AI in African Studies.</p>

    <p>If you work at this intersection, what examples, tools or considerations should we be aware of? We welcome your suggestions!</p>
  `,
	tags: ['Volkswagen Foundation', 'Grant', 'Workshop', 'Digital Humanities', 'AI', 'African Studies'],
	panelType: 'grant',
	image: '',
	heroImage: {
		src: 'images/activities/VolkswagenStiftung-logo.webp',
		alt: 'VolkswagenStiftung logo',
		caption: ''
	},
	type: 'grant'
};

export default activity;
