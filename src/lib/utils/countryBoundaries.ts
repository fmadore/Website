import type { CountryBoundaryCollection } from './choropleth';
import { retryableLoader } from './retryableLoader';

/** Lazily shared across maps; a failed request can be retried after connectivity returns. */
export function createBoundaryLoader(url: string, fetcher = globalThis.fetch) {
	return retryableLoader(async (): Promise<CountryBoundaryCollection> => {
		const response = await fetcher(url, { signal: AbortSignal.timeout(10000) });
		if (!response.ok) throw new Error(`Country boundaries returned HTTP ${response.status}.`);
		const collection = await response.json();
		if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features))
			throw new Error('Country boundary data has an invalid format.');
		return collection as CountryBoundaryCollection;
	});
}
