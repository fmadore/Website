// src/lib/data/media-appearances/index.ts
import type { MediaAppearance } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';

type ModuleType = Record<string, any>;

const templateIds: string[] = [
	// 'media-appearance-template-id'
];

const mediaModules = import.meta.glob<ModuleType>(['./*.ts'], { eager: true });

const allMediaAppearances: MediaAppearance[] = loadData<MediaAppearance>(
	mediaModules,
	templateIds,
	'media-appearance'
);

// Sort by date (most recent first)
export const mediaAppearancesByDate = [...allMediaAppearances].sort((a, b) => {
	return new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime();
});

export { allMediaAppearances };
