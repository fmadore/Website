import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'religious-activism-campuses-review-thompson-2026',
	title: "K.D. Thompson's review of 'Religious Activism on Campuses in Togo and Benin'",
	dateISO: '2026-01-28',
	date: formatDisplayDate('2026-01-28'),
	year: 2026,
	description:
		"K.D. Thompson reviewed my book Religious Activism on Campuses in Togo and Benin in The Journal of Modern African Studies.",
	content: `
        <p>K.D. Thompson has published a review of my book <a href="https://doi.org/10.1515/9783111428895" target="_blank" rel="noreferrer noopener"><em>Religious Activism on Campuses in Togo and Benin</em></a> in <a href="https://doi.org/10.1017/S0022278X25101195" target="_blank" rel="noreferrer noopener"><em>The Journal of Modern African Studies</em></a>.</p>

        <p>I appreciate the thoughtful engagement with the book and the constructive criticism. Thompson raises valid points about the theoretical development of the "social curriculum" concept and the "entrepreneurial turn," suggesting that deeper analysis of their implications for religious subjectivity, neoliberalism, and social justice would have strengthened the argument.</p>

        <p>The review also notes that the book's broad scope—covering five decades and multiple organisations across two countries—while providing invaluable documentary evidence, sometimes sacrifices sustained focus on particular associations or specific activists' trajectories. These are helpful observations for future research directions.</p>

        <p>Here's an excerpt:</p>

        <blockquote>
        <p>"Madore has produced an important work that documents previously neglected histories and demonstrates the significance of faith-based associations in shaping student activism, religious dynamics, and elite formation in West Africa. The book will be valuable for scholars of religion and higher education in Africa, students of social movements and those interested in how religious identity intersects with political and economic change."</p>
        </blockquote>

        <p>Thompson, K.D. "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023 by Frédérick Madore. Berlin: De Gruyter, 2025. Pp. xiii + 259. €79.99 (Hbk)." <em>The Journal of Modern African Studies</em> (2026): 1–3. <a href="https://doi.org/10.1017/S0022278X25101195" target="_blank" rel="noreferrer noopener">https://doi.org/10.1017/S0022278X25101195</a>.</p>
    `,
	tags: ['Book Review', 'Religious Activism', 'Togo', 'Benin', 'Publication'],
	panelType: 'publication',
	type: 'publication',
	url: 'https://doi.org/10.1017/S0022278X25101195'
};
