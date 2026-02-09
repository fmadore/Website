import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all DH project files
const projectModules = import.meta.glob<Record<string, DigitalHumanitiesProject>>(
	['./*.ts', '!./index.ts'],
	{ eager: true }
);

// Load and validate projects using loadData (no template to filter)
export const allDhProjects: DigitalHumanitiesProject[] = loadData<DigitalHumanitiesProject>(
	projectModules,
	[],
	'digital-humanities-project'
).sort((a, b) => {
	// Featured projects come first
	const featuredA = a.featured ? 0 : 1;
	const featuredB = b.featured ? 0 : 1;
	if (featuredA !== featuredB) {
		return featuredA - featuredB;
	}

	// Then sort by order property
	const orderA = a.order === undefined ? Infinity : a.order;
	const orderB = b.order === undefined ? Infinity : b.order;

	if (orderA === orderB) {
		// If orders are the same (or both undefined), sort by title
		return a.title.localeCompare(b.title);
	}
	return orderA - orderB;
});
