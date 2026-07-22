import type { Communication } from '$lib/types/communication';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all event files (excluding this index and the template)
const eventModules = import.meta.glob(['./*.ts', '!./index.ts', '!./event-template.ts'], {
	eager: true
});

const allEvents: Communication[] = loadData<Communication>(
	eventModules,
	'event-template-id',
	'event'
);

export { allEvents };
