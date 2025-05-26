// src/lib/data/appointments/index.ts
import type { Appointment } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'appointment-template-id'
];

const appointmentModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allAppointments: Appointment[] = loadData<Appointment>(
	appointmentModules,
	templateIds,
	'appointment'
);

// Sort by start date (most recent first)
export const appointmentsByDate = [...allAppointments].sort((a, b) => {
	// Primarily sort by start date descending
	const dateComparison = new Date(b.dateISOStart).getTime() - new Date(a.dateISOStart).getTime();
	if (dateComparison !== 0) {
		return dateComparison;
	}
	// If start dates are the same, sort ongoing before finished
	if (a.endYear === null && b.endYear !== null) return -1; // a is ongoing, b is not -> a first
	if (a.endYear !== null && b.endYear === null) return 1; // b is ongoing, a is not -> b first
	// If both ongoing or both finished with same start, sort by end date descending (if available)
	if (a.dateISOEnd && b.dateISOEnd) {
		return new Date(b.dateISOEnd).getTime() - new Date(a.dateISOEnd).getTime();
	}
	return 0; // Keep original order if start/end dates are identical
});

export { allAppointments };
