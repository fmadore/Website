/**
 * The two groups the /digital-humanities section files its records under:
 * digital humanities projects, and software & applications.
 *
 * One record, one address: an application is a `DigitalHumanitiesProject` that
 * carries an `application` block, never a second record. The index, the CV,
 * the Markdown twins, the JSON API and both MCP servers all read the group
 * from here, so they cannot disagree about which records are applications or
 * how an application's platform and status are printed.
 *
 * Pure and dataset-free, like `cvSections.ts`: each function takes the
 * records it reads.
 */
import type { DhProjectGroup } from '#lib/apiContract.ts';
import type {
	ApplicationStatus,
	DigitalHumanitiesProject,
	SoftwareApplication
} from '#lib/types/digitalHumanities.ts';

export type { DhProjectGroup };

/** The group a record is filed under: `software` when it carries an `application` block. */
export function projectGroup(
	project: Pick<DigitalHumanitiesProject, 'application'>
): DhProjectGroup {
	return project.application ? 'software' : 'project';
}

/** Splits records into the two groups, each keeping the order it was given. */
export function splitProjectGroups<T extends Pick<DigitalHumanitiesProject, 'application'>>(
	records: readonly T[]
): { projects: T[]; applications: T[] } {
	return {
		projects: records.filter((record) => projectGroup(record) === 'project'),
		applications: records.filter((record) => projectGroup(record) === 'software')
	};
}

const STATUS_LABELS: Record<ApplicationStatus, string> = {
	released: 'Released',
	beta: 'Public beta',
	'in-development': 'In development'
};

/** "Released", "Public beta", "In development". */
export function applicationStatusLabel(status: ApplicationStatus): string {
	return STATUS_LABELS[status];
}

/** "Windows 11 (x64, ARM64)": the operating system, then the architectures it ships for. */
export function applicationPlatform(
	app: Pick<SoftwareApplication, 'operatingSystem' | 'architectures'>
): string {
	return app.architectures?.length
		? `${app.operatingSystem} (${app.architectures.join(', ')})`
		: app.operatingSystem;
}

/** "MIT licence", or undefined when the record states none. */
export function applicationLicence(app: Pick<SoftwareApplication, 'licence'>): string | undefined {
	return app.licence ? `${app.licence} licence` : undefined;
}

/**
 * The one-line description of an application the index entry and the CV
 * print: "Windows 11 (x64, ARM64) · Released · MIT licence".
 */
export function applicationSummary(app: SoftwareApplication): string {
	return [applicationPlatform(app), applicationStatusLabel(app.status), applicationLicence(app)]
		.filter(Boolean)
		.join(' · ');
}
