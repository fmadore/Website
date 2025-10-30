import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'dh-ai-african-studies-edited-volume',
	title: 'Call for Chapters: Digital Humanities and AI in African Studies',
	dateISO: '2025-10-30',
	date: formatDisplayDate('2025-10-30'),
	year: 2025,
	description:
		'Call for chapter proposals for an edited volume on Digital Humanities and Artificial Intelligence in African Studies, to be published by Bielefeld University Press.',
	content: `
        <p><a href="https://www.kcl.ac.uk/people/vincent-hiribarren" target="_blank" rel="noopener noreferrer">Vincent Hiribarren</a> and I are seeking chapter proposals for an edited volume tentatively titled <em>Digital Humanities and Artificial Intelligence in African Studies</em>, which will be submitted to the <a href="https://www.transcript-verlag.de/digital-humanities-research" target="_blank" rel="noopener noreferrer">Digital Humanities Research Series</a> at Bielefeld University Press.</p>
        
        <p>We seek contributions grounded in African Studies that reimagine DH from African perspectives. We especially welcome proposals from scholars and practitioners based in Sub-Saharan Africa.</p>
        
        <h3>Suggested themes</h3>
        <ol>
            <li>1. Transforming Research Methods through AI and Digital Tools in African Studies</li>
            <li>2. Building Sustainable Research Infrastructures from African Perspectives</li>
            <li>3. Centring African Knowledge Systems in Digital Research Design</li>
        </ol>
        
        <h3>Submission details</h3>
        <p><strong>Deadline:</strong> A 250-word abstract by <strong>15 December 2025</strong>.</p>
        
        <p>See below for the full call for chapters.</p>
    `,
	tags: ['Digital Humanities', 'AI', 'African Studies', 'Call for Papers'],
	type: 'publication',
	image: '',
	heroImage: {
		src: '',
		alt: '',
		caption: ''
	},
	pdfPath: 'files/CfC-DH-and-AI-in-African-Studies.pdf',
	pdfTitle: 'Call for Chapters',
	panelType: 'publication'
};
