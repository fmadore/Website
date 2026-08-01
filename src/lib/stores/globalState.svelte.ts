/** Minimal shared network state. */

let isOnline = $state(true);

export function getGlobalState() {
	return {
		get isOnline() {
			return isOnline;
		},
		set isOnline(value: boolean) {
			isOnline = value;
		}
	};
}

export type GlobalState = ReturnType<typeof getGlobalState>;
