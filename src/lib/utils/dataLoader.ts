import { selectDataRecord } from '$lib/dataRecords';

/** Every matched source must produce one record; only explicit template IDs are omitted. */
export function loadData<T extends { id: string }>(
	modules: Record<string, unknown>,
	templateIdFilter: string | readonly string[],
	dataTypeName = 'item',
	transform?: (item: T, path: string) => T
): T[] {
	const excluded = new Set(
		typeof templateIdFilter === 'string' ? [templateIdFilter] : templateIdFilter
	);
	const seen = new Map<string, string>();
	const items: T[] = [];
	for (const [path, module] of Object.entries(modules)) {
		const source = dataTypeName + ' ' + path;
		const record = selectDataRecord(module, source);
		if (excluded.has(record.id)) continue;
		let item: T;
		try {
			item = transform ? transform(record as unknown as T, path) : (record as unknown as T);
		} catch (cause) {
			throw new Error(source + ': transform failed', { cause });
		}
		selectDataRecord({ item }, source);
		if (seen.has(item.id))
			throw new Error(source + ': duplicate id ' + item.id + ' (also ' + seen.get(item.id) + ')');
		seen.set(item.id, path);
		items.push(item);
	}
	return items;
}
