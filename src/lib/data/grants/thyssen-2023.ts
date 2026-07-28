// src/lib/data/grants/thyssen-2023.ts
import type { Grant } from '$lib/types';

export const thyssen2023: Grant = {
	id: 'fritz-thyssen-2023',
	title: 'Support for an international conference',
	projectTitle:
		'University Campuses in Africa and Beyond: Training Grounds, Moral Spaces and Political Arenas',
	funder: 'Fritz Thyssen Foundation',
	project: 'Religious Activism on Campuses in Togo and Benin',
	startYear: 2023,
	endYear: 2023,
	dateRangeString: '2023',
	dateISOStart: '2023-09-01',
	dateISOEnd: '2023-09-31',
	amount: 20000,
	currency: 'EUR',
	status: 'Awarded',
	coApplicants: ['Abdoulaye Sounaye'],
	// The foundation has no per-grant page; the award is recorded in its 2023
	// annual report (PDF).
	url: 'https://www.fritz-thyssen-stiftung.de/cms/wp-content/uploads/2024/07/Jahresbericht-der-Fritz-Thyssen-Stiftung-2023.pdf'
};

export default thyssen2023;
