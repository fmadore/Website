/**
 * The order the /digital-humanities index prints projects in: featured first,
 * then by `order`, then by title. Shared by the full index and the summaries
 * so the two lists cannot disagree.
 */
export function compareDhProjects(
	a: { featured?: boolean; order?: number; title: string },
	b: { featured?: boolean; order?: number; title: string }
): number {
	const featuredA = a.featured ? 0 : 1;
	const featuredB = b.featured ? 0 : 1;
	if (featuredA !== featuredB) return featuredA - featuredB;
	const orderA = a.order === undefined ? Infinity : a.order;
	const orderB = b.order === undefined ? Infinity : b.order;
	if (orderA === orderB) return a.title.localeCompare(b.title);
	return orderA - orderB;
}
