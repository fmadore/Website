import type { Communication } from '$lib/types/communication';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all event files (exclude index to avoid circular import)
const eventModules = import.meta.glob('./*.ts', { eager: true });
// Remove self from modules to avoid circular reference
delete eventModules['./index.ts'];

const allEvents: Communication[] = loadData<Communication>(
	eventModules,
	'event-template-id',
	'event'
);

export { allEvents };
