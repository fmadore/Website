/** Shared by Vite and Node generators. No runtime aliases or framework dependencies. */
export function selectDataRecord(
	module: unknown,
	source: string
): Record<string, unknown> & { id: string } {
	if (!module || typeof module !== 'object') throw new Error(`${source}: expected a data module`);
	const records = [
		...new Set(
			Object.values(module).filter(
				(value): value is Record<string, unknown> =>
					value !== null && typeof value === 'object' && 'id' in value
			)
		)
	];
	if (records.length !== 1)
		throw new Error(`${source}: expected exactly one data record, found ${records.length}`);
	const record = records[0]!;
	if (typeof record.id !== 'string' || !record.id || /\s/.test(record.id)) {
		throw new Error(`${source}: record id must be a nonempty string without whitespace`);
	}
	return record as Record<string, unknown> & { id: string };
}
