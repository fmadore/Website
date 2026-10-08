import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'religious-activism-campuses-review-swagler-2026',
	title: "Matthew Swagler's review of 'Religious Activism on Campuses in Togo and Benin'",
	dateISO: '2026-10-08',
	date: formatDisplayDate('2026-10-08'),
	year: 2026,
	description:
		"Matthew Swagler reviewed my book Religious Activism on Campuses in Togo and Benin in The American Historical Review, and raises a question worth pursuing: what did the 'good life' mean to the students themselves?",
	content: `
        <p>Very glad that my book <a href="/publications/religious-activism-campuses"><em>Religious Activism on Campuses in Togo and Benin</em></a> has been reviewed by Matthew Swagler (Connecticut College) in the latest issue of <a href="https://doi.org/10.1093/ahr/rhag129" target="_blank" rel="noreferrer noopener"><em>The American Historical Review</em></a>. He calls it “an important resource for historians of contemporary religion, higher education, and politics.”</p>

        <p>I also appreciate the question he raises. The book argues that Christian and Muslim student associations allow students to pursue their own idea of the “good life”, but what does this actually mean to them? Was it piety, a career, moral standing among their peers or a role in building the nation? This is a question that deserves more space than I gave it.</p>

        <p>Many thanks to him for such a careful reading.</p>

        <p>The book is in open access: <a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noreferrer noopener">https://doi.org/10.1515/9783111428895</a>.</p>

        <p>Swagler, Matthew. “Frédérick Madore. <em>Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023</em>.” <em>The American Historical Review</em> 131, no. 3 (2026): 1417–18. <a href="https://doi.org/10.1093/ahr/rhag129" target="_blank" rel="noreferrer noopener">https://doi.org/10.1093/ahr/rhag129</a>.</p>
    `,
	tags: [
		'Book Review',
		'Religious Activism',
		'Togo',
		'Benin',
		'Publication',
		'Islam',
		'West Africa'
	],
	panelType: 'publication',
	heroImage: {
		src: 'images/activities/ahr-review-hero.webp',
		alt: "Screenshot of The American Historical Review website showing Matthew Swagler's review of Religious Activism on Campuses in Togo and Benin in Volume 131, Issue 3, September 2026"
	},
	type: 'publication',
	url: 'https://doi.org/10.1093/ahr/rhag129'
};
