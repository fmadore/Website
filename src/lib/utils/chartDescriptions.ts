/**
 * Accessible chart descriptions.
 *
 * ECharts renders to canvas, so the only thing a screen reader gets is the
 * string handed to `aria.label.description`. Left to itself the library
 * generates a couple of thousand characters of series dump — every category,
 * every value, `NaN` where a stack has a gap. None of that is a description.
 *
 * These builders write the sentence a reader actually needs: what is counted,
 * over what span, and where the extremes are. They are pure, so they are unit
 * tested rather than eyeballed on a canvas, and every figure in them is
 * computed from the same data the chart draws.
 *
 * The item noun is always a parameter: the publications page counts
 * publications, the talks page counts talks, and neither word is hard-coded.
 */

/** A single category and its value: one bar, one tile, one stacked column. */
export interface LabelledValue {
	label: string;
	value: number;
}

/** Singular/plural pair for a counted noun. */
export interface Noun {
	singular: string;
	plural: string;
}

/** `1 page` / `449 pages`. */
export function countOf(n: number, noun: Noun): string {
	return `${n} ${n === 1 ? noun.singular : noun.plural}`;
}

/** `2013 to 2026`, or just `2013` when the series is one category wide. */
function spanOf(data: LabelledValue[]): string {
	const first = data[0]!.label;
	const last = data[data.length - 1]!.label;
	return first === last ? first : `${first} to ${last}`;
}

function extremes(data: LabelledValue[]): { highest: LabelledValue; lowest: LabelledValue } {
	let highest = data[0]!;
	let lowest = data[0]!;
	for (const datum of data) {
		if (datum.value > highest.value) highest = datum;
		if (datum.value < lowest.value) lowest = datum;
	}
	return { highest, lowest };
}

/**
 * A single series over ordered categories (pages per year, citations per year).
 *
 * `Pages published per year, 2013 to 2026. Highest: 2018, 449 pages. Lowest: 2014, 2 pages.`
 */
export function describeSeries(measure: string, data: LabelledValue[], noun: Noun): string {
	if (data.length === 0) return `${measure}: no data recorded.`;
	const { highest, lowest } = extremes(data);
	const head = `${measure}, ${spanOf(data)}.`;
	if (highest.label === lowest.label) {
		return `${head} ${highest.label}: ${countOf(highest.value, noun)}.`;
	}
	return (
		`${head} Highest: ${highest.label}, ${countOf(highest.value, noun)}.` +
		` Lowest: ${lowest.label}, ${countOf(lowest.value, noun)}.`
	);
}

/**
 * A stacked series: category totals plus how many layers are stacked.
 *
 * `Publications per year by type, 2013 to 2026, in 8 types. Busiest year: 2016, 6 publications.`
 */
export function describeStack(
	measure: string,
	totals: LabelledValue[],
	seriesCount: number,
	noun: Noun,
	seriesNoun: Noun = { singular: 'type', plural: 'types' }
): string {
	if (totals.length === 0) return `${measure}: no data recorded.`;
	const { highest } = extremes(totals);
	return (
		`${measure}, ${spanOf(totals)}, in ${countOf(seriesCount, seriesNoun)}.` +
		` Busiest ${totals.length === 1 ? 'category' : 'year'}: ${highest.label}, ${countOf(highest.value, noun)}.`
	);
}

/**
 * A ranked list of bars (phrase frequencies, citations per author).
 *
 * `Two-word phrases by frequency, 30 phrases. Most frequent: jeune musulman, 52.`
 */
export function describeRanked(
	measure: string,
	data: LabelledValue[],
	noun: Noun,
	lead: string = 'Most frequent'
): string {
	if (data.length === 0) return `${measure}: no data recorded.`;
	const { highest } = extremes(data);
	return `${measure}, ${countOf(data.length, noun)}. ${lead}: ${highest.label}, ${highest.value}.`;
}

/** One group of a treemap: a parent tile and the leaves inside it. */
export interface TreemapGroup {
	label: string;
	children: LabelledValue[];
}

/**
 * A two-level treemap: how many leaves, in how many groups, and the largest leaf.
 *
 * `Publication venues: 26 venues in 2 groups. Largest: Islamic Africa, 4 publications.`
 */
export function describeTreemap(
	title: string,
	groups: TreemapGroup[],
	entryNoun: Noun,
	itemNoun: Noun
): string {
	const leaves = groups.flatMap((group) => group.children);
	if (leaves.length === 0) return `${title}: no data recorded.`;
	const { highest } = extremes(leaves);
	const groupNoun: Noun = { singular: 'group', plural: 'groups' };
	return (
		`${title}: ${countOf(leaves.length, entryNoun)} in ${countOf(groups.length, groupNoun)}.` +
		` Largest: ${highest.label}, ${countOf(highest.value, itemNoun)}.`
	);
}
