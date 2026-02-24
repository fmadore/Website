// src/lib/data/media-appearances/index.ts
import type { MediaAppearance } from '$lib/types';
import { loadData } from '$lib/utils/dataLoader';
import { sortByDate } from '$lib/utils/dataAggregation';

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
export const mediaAppearancesByDate = sortByDate(allMediaAppearances);

export { allMediaAppearances };
