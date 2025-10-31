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

// Sort by start year descending (most recent first), then handle overlaps
export const appointmentsByDate = [...allAppointments].sort((a, b) => {
	// Handle ongoing positions (null endYear) - put them first
	if (a.endYear === null && b.endYear !== null) return -1;
	if (a.endYear !== null && b.endYear === null) return 1;
	if (a.endYear === null && b.endYear === null) {
		// Both ongoing, sort by start year descending
		return b.startYear - a.startYear;
	}
	
	// For finished positions, sort by end year descending
	if (a.endYear !== b.endYear) {
		return (b.endYear || 0) - (a.endYear || 0);
	}
	
	// Same end year, sort by start year descending (more recent start first)
	return b.startYear - a.startYear;
});

export { allAppointments };
