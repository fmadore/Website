/** Pagination resets when the result collection changes, even at equal counts. */
export function usePagination<T>(getItems: () => readonly T[], perPage: number) {
	let page = $state(1);
	const all = $derived(getItems());
	const totalPages = $derived(Math.max(1, Math.ceil(all.length / perPage)));
	const start = $derived((Math.min(page, totalPages) - 1) * perPage);
	const items = $derived(all.slice(start, start + perPage));
	$effect(() => {
		void all;
		void all.length;
		page = 1;
	});
	return {
		get page() {
			return Math.min(page, totalPages);
		},
		set page(value: number) {
			page = Math.max(1, Math.min(Math.trunc(value) || 1, totalPages));
		},
		get items() {
			return items;
		}
	};
}
