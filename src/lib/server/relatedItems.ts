import type { Contributor } from '#lib/types/contributor.ts';
import { getContributorNames } from '#lib/utils/contributor.ts';

interface RelatedRecord {
	id: string;
	project?: string;
	date?: string;
	title?: string;
	authors?: Contributor[];
}

/** Only the fields a related-record link renders cross the prerender boundary. */
export function relatedItems<T extends RelatedRecord>(items: T[], current: T) {
	if (!current.project) return [];
	return items
		.filter((item) => item.id !== current.id && item.project === current.project)
		.slice(0, 3)
		.map(({ id, title, date, authors, project }) => ({
			id,
			title,
			date,
			authors: getContributorNames(authors),
			project
		}));
}
