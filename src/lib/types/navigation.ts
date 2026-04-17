export interface NavItem {
	name: string;
	path: string;
	dropdown?: NavItem[];
	/**
	 * Optional extra `rel` tokens appended to the anchor for external links.
	 * The `noopener noreferrer` pair is always added automatically on external
	 * `http(s)` paths; use this field for identity markers like `me` or
	 * `author`.
	 */
	rel?: string;
}
