import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';
import { loadData } from '$lib/utils/dataLoader';
import { compareDhProjects } from './order';

// Dynamically import all DH project files (excluding this index and the
// modules beside the records that are not records: the ordering helper and
// the summaries projection with its config and tests)
const projectModules = import.meta.glob<Record<string, DigitalHumanitiesProject>>(
	[
		'./*.ts',
		'!./index.ts',
		'!./order.ts',
		'!./summaries.ts',
		'!./summaries.generated.ts',
		'!./summaryConfig.ts',
		'!./*.test.ts'
	],
	{ eager: true }
);

// Load and validate projects using loadData (no template to filter)
export const allDhProjects: DigitalHumanitiesProject[] = loadData<DigitalHumanitiesProject>(
	projectModules,
	[],
	'digital-humanities-project'
).sort(compareDhProjects);
