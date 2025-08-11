import type { Communication } from '$lib/types/communication';

// Define a type for module imports
type ModuleType = Record<string, any>;

// Dynamically import all event files
const eventModules = import.meta.glob<ModuleType>('./*.ts', { eager: true });

// Filter out the index file itself and the template
const filteredModules = Object.entries(eventModules).filter(
	([path]) => !path.includes('index.ts') && !path.includes('template.ts')
);

// Extract the event objects from the modules
const allEvents: Communication[] = filteredModules
	.map(([path, module]) => {
		try {
			// If there's a default export, use it, otherwise take the first exported value
			return 'default' in module ? module.default : (Object.values(module)[0] as Communication);
		} catch (error) {
			console.warn(`Error processing event module ${path}:`, error);
			return null;
		}
	})
	.filter((event): event is Communication => {
		return event !== null && event.id !== undefined;
	});

export { allEvents };
