/** Share successful and in-flight loads, but never retain a rejected attempt. */
export function retryableLoader<T>(load: () => Promise<T>): () => Promise<T> {
	let pending: Promise<T> | undefined;
	return () => {
		pending ??= Promise.resolve()
			.then(load)
			.catch((error) => {
				pending = undefined;
				throw error;
			});
		return pending;
	};
}
