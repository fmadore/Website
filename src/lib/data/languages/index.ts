// src/lib/data/languages/index.ts
import type { Language } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'language-template-id'
];

const languageModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allLanguages: Language[] = loadData<Language>(languageModules, templateIds, 'language');

// Sort by order (ascending)
export const languagesByProficiency = [...allLanguages].sort((a, b) => {
	return (a.order || 0) - (b.order || 0);
});

export { allLanguages };
