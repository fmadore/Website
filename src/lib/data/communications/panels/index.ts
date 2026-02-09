import type { Communication } from '$lib/types/communication';
import { loadData } from '$lib/utils/dataLoader';

// Dynamically import all panel files (exclude index to avoid circular import)
const panelModules = import.meta.glob('./*.ts', { eager: true });
// Remove self from modules to avoid circular reference
delete panelModules['./index.ts'];

const allPanels: Communication[] = loadData<Communication>(
	panelModules,
	'panel-template-id',
	'panel'
);

export { allPanels };
