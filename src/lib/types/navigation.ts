export interface NavItem {
	name: string;
	path: string;
	dropdown?: NavItem[];
}
