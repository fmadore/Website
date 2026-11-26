import { describe, expect, it } from 'vitest';
import { navItems } from './navigation.ts';
import { allResearchProjects } from './research/index.ts';

/**
 * The Research dropdown is written out by hand, because `navigation.ts` is read
 * by the header on every page and must not pull the research dataset into the
 * app shell (`check:bundle`). This test is what keeps the two lists in step: a
 * new project record fails here until it has its menu entry, and a menu entry
 * whose record was renamed or removed fails too.
 */
describe('Research navigation', () => {
	it('lists exactly one entry per research project', () => {
		const research = navItems.find((item) => item.path === '/research');
		const menuPaths = (research?.dropdown ?? []).map((entry) => entry.path);
		const projectPaths = allResearchProjects.map((project) => `/research/${project.id}`);

		expect(new Set(menuPaths).size).toBe(menuPaths.length);
		expect([...menuPaths].sort()).toEqual([...projectPaths].sort());
	});
});
