import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'religious-activism-campuses-review-thompson-2026',
	title: "K.D. Thompson's review of 'Religious Activism on Campuses in Togo and Benin'",
	dateISO: '2026-01-28',
	date: formatDisplayDate('2026-01-28'),
	year: 2026,
	description:
		"K.D. Thompson reviewed my book Religious Activism on Campuses in Togo and Benin in The Journal of Modern African Studies, describing it as 'a vital contribution to our understanding of West African faith-based student associations'.",
	content: `
        <p>My book <a href="/publications/religious-activism-campuses"><em>Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023</em></a> (De Gruyter, 2025) has been reviewed by <a href="https://religiousstudies.wisc.edu/staff/kdthompson/" target="_blank" rel="noreferrer noopener">K.D. Thompson</a> in <a href="https://doi.org/10.1017/S0022278X25101195" target="_blank" rel="noreferrer noopener"><em>The Journal of Modern African Studies</em></a>.</p>

        <p>Thompson describes the book as making "a vital contribution to our understanding of West African faith-based student associations" and notes the breadth of the research:</p>

        <blockquote>
        <p>"Through an impressive body of research – 81 formal interviews and focus groups, participant observation during multiple field visits spanning 2019–2024, and extensive archival work – Madore documents how Christian and Muslim student groups have not merely survived but thrived under authoritarian regimes, through periods of democratisation, and amid shifting applications of <em>laïcité</em> (secularism) on campuses."</p>
        </blockquote>

        <p>The review highlights several strengths of the book, including "its comparative framework examining both countries and multiple faith traditions, its attention to transnational influences, and its documentation of overlooked histories." Thompson notes that the book "convincingly demonstrates that these associations provided alternative pathways for pursuing 'the good life' amid economic precarity and political uncertainty."</p>

        <p>The review also offers constructive observations, particularly regarding the theorisation of key concepts like "social curriculum" and the need for more sustained attention to gender dynamics. These are areas that merit further scholarly attention.</p>

        <p>In conclusion, Thompson writes:</p>

        <blockquote>
        <p>"By positioning universities as incubators of religious elites and sites where competing visions of the good life are articulated and pursued, Madore makes a compelling case for taking faith-based student activism seriously in understanding contemporary African societies."</p>
        </blockquote>

        <p>Thompson, K.D. "Religious Activism on Campuses in Togo and Benin: Christian and Muslim Students Navigating Authoritarianism and Laïcité, 1970–2023 by Frédérick Madore. Berlin: De Gruyter, 2025. Pp. xiii + 259. €79.99 (Hbk)." <em>The Journal of Modern African Studies</em> (2026): 1–3. <a href="https://doi.org/10.1017/S0022278X25101195" target="_blank" rel="noreferrer noopener">https://doi.org/10.1017/S0022278X25101195</a>.</p>
    `,
	tags: ['Book Review', 'Religious Activism', 'Togo', 'Benin', 'Publication'],
	panelType: 'publication',
	type: 'publication',
	url: 'https://doi.org/10.1017/S0022278X25101195'
};
