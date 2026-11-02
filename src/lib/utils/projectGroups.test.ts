import { describe, expect, it } from 'vitest';
import { allDhProjects } from '#lib/data/digital-humanities/index.ts';
import type { SoftwareApplication } from '#lib/types/digitalHumanities.ts';
import {
	applicationPlatform,
	applicationSummary,
	projectGroup,
	splitProjectGroups
} from './projectGroups';

const app: SoftwareApplication = {
	status: 'released',
	operatingSystem: 'Windows 11',
	architectures: ['x64', 'ARM64'],
	licence: 'MIT'
};

describe('projectGroup', () => {
	it('files a record with an application block as software, and any other as a project', () => {
		expect(projectGroup({ application: app })).toBe('software');
		expect(projectGroup({})).toBe('project');
	});

	it('splits records into the two groups, keeping their order', () => {
		const records = [
			{ id: 'a' },
			{ id: 'b', application: app },
			{ id: 'c' },
			{ id: 'd', application: app }
		];
		const { projects, applications } = splitProjectGroups(records);
		expect(projects.map((record) => record.id)).toEqual(['a', 'c']);
		expect(applications.map((record) => record.id)).toEqual(['b', 'd']);
	});
});

describe('application lines', () => {
	it('print the platform with its architectures, the status and the licence', () => {
		expect(applicationSummary(app)).toBe('Windows 11 (x64, ARM64) · Released · MIT licence');
	});

	it('leave out what the record does not state', () => {
		expect(applicationPlatform({ operatingSystem: 'Windows 11' })).toBe('Windows 11');
		expect(applicationSummary({ status: 'beta', operatingSystem: 'Windows 11' })).toBe(
			'Windows 11 · Public beta'
		);
	});
});

describe('the dataset', () => {
	// An application is obtained somewhere: the record rail's button, the CV's
	// Install row and the JSON-LD installUrl all read the first install link.
	it('gives every application an install address and a source repository', () => {
		const { applications } = splitProjectGroups(allDhProjects);
		expect(applications.length).toBeGreaterThan(0);
		for (const record of applications) {
			const types = (record.links ?? []).map((link) => link.type);
			expect(types, record.id).toContain('install');
			expect(types, record.id).toContain('code');
		}
	});
});
