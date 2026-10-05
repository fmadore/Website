import type { Person } from '$lib/types/person';
import { loadData } from '$lib/utils/dataLoader';

const modules = import.meta.glob(['./*.ts', '!./index.ts', '!./*.test.ts'], { eager: true });

/** Loaded only when a reader selects the collaborator map. */
export const allPeople = loadData<Person>(modules, [], 'person').sort((a, b) =>
	a.name.localeCompare(b.name)
);
