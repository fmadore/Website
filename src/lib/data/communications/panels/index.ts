import type { Communication } from '$lib/types/communication';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Dynamically import all panel files
const panelModules = import.meta.glob<ModuleType>('./*.ts', { eager: true });

// Filter out the index file itself and the template
const filteredModules = Object.entries(panelModules).filter(
	([path]) => !path.includes('index.ts') && !path.includes('template.ts')
);

// Extract the panel objects from the modules
const allPanels: Communication[] = filteredModules
	.map(([path, module]) => {
		try {
			// If there's a default export, use it, otherwise take the first exported value
			return 'default' in module ? module.default : (Object.values(module)[0] as Communication);
		} catch (error) {
			console.warn(`Error processing panel module ${path}:`, error);
			return null;
		}
	})
	.filter((panel): panel is Communication => {
		return panel !== null && panel.id !== undefined;
	});

export { allPanels };
