// src/lib/data/appointments/index.ts
import type { Appointment } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByYearRange } from '$lib/utils/dataAggregation';

type ModuleType = Record<string, unknown>;

const templateIds: string[] = [
	// 'appointment-template-id'
];

const appointmentModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts'], {
	eager: true
});

const allAppointments: Appointment[] = loadData<Appointment>(
	appointmentModules,
	templateIds,
	'appointment'
);

// Ongoing appointments first, then by end/start year descending
export const appointmentsByDate = sortByYearRange(allAppointments);

export { allAppointments };
