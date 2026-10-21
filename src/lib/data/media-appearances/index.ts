// src/lib/data/media-appearances/index.ts
import type { MediaAppearance } from '#lib/types/index.ts';
import { loadData } from '#lib/utils/dataLoader.ts';
import { sortByDate } from '#lib/utils/dataAggregation.ts';

type ModuleType = Record<string, unknown>;

const templateIds: string[] = [
	// 'media-appearance-template-id'
];

const mediaModules = import.meta.glob<ModuleType>(['./*.ts', '!./index.ts'], { eager: true });

const allMediaAppearances: MediaAppearance[] = loadData<MediaAppearance>(
	mediaModules,
	templateIds,
	'media-appearance'
);

// Sort by date (most recent first)
export const mediaAppearancesByDate = sortByDate(allMediaAppearances);

export { allMediaAppearances };
