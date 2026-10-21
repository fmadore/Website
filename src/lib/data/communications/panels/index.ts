import type { Communication } from '#lib/types/communication.ts';
import { loadData } from '#lib/utils/dataLoader.ts';

// Dynamically import all panel files (excluding this index and the template)
const panelModules = import.meta.glob(['./*.ts', '!./index.ts', '!./panel-template.ts'], {
	eager: true
});

const allPanels: Communication[] = loadData<Communication>(
	panelModules,
	'panel-template-id',
	'panel'
);

export { allPanels };
