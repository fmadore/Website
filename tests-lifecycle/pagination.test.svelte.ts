import { afterEach, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { usePagination } from '../src/lib/utils/pagination.svelte';
let stop: (() => void) | undefined;
afterEach(() => {
	stop?.();
	stop = undefined;
});
it('resets on equal-sized result changes and clamps requested pages', () => {
	const state = $state({ rows: [1, 2, 3, 4] });
	let pagination!: ReturnType<typeof usePagination<number>>;
	stop = $effect.root(() => {
		pagination = usePagination(() => state.rows, 2);
	});
	flushSync();
	expect(pagination.items).toEqual([1, 2]);
	pagination.page = 2;
	flushSync();
	expect(pagination.items).toEqual([3, 4]);
	state.rows = [5, 6, 7, 8];
	flushSync();
	expect(pagination.page).toBe(1);
	expect(pagination.items).toEqual([5, 6]);
	pagination.page = 99;
	flushSync();
	expect(pagination.page).toBe(2);
	pagination.page = -1;
	flushSync();
	expect(pagination.page).toBe(1);
	state.rows = [];
	flushSync();
	expect(pagination.items).toEqual([]);
	expect(pagination.page).toBe(1);
});
