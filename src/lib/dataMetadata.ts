/** Alias-free metadata used by both Vite indexes and Node projections. */
export const PUBLICATION_TEMPLATE_IDS = [
	'book-template-id',
	'edited-volume-template-id',
	'article-template-id',
	'bulletin-article-template-id',
	'chapter-template-id',
	'special-issue-template-id',
	'report-template-id',
	'encyclopedia-template-id',
	'blogpost-template-id',
	'phd-dissertation-template-id',
	'conference-proceedings-template-id',
	'working-paper-template-id'
];
export const COMMUNICATION_TEMPLATE_IDS = [
	'paper-template-id',
	'panel-template-id',
	'talk-template-id',
	'poster-template-id',
	'event-template-id',
	'podcast-template-id'
];
export const PUBLICATION_DIRECTORY_TYPES: Record<string, string> = {
	books: 'books',
	articles: 'articles',
	bulletins: 'bulletins',
	chapters: 'chapters',
	'special-issues': 'specialIssues',
	reports: 'reports',
	encyclopedia: 'encyclopedia',
	blogposts: 'blogposts',
	dissertations: 'dissertations',
	proceedings: 'proceedings',
	'working-papers': 'workingPapers'
};
