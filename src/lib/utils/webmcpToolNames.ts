/**
 * The WebMCP tools the site registers, by name, in registration order.
 *
 * Dependency-free on purpose: `webmcp.ts` types its definitions by this list,
 * and `scripts/check-agentic.mjs` imports it under plain Node (type stripping,
 * no `$lib` alias) to assert that Lighthouse sees exactly these tools on the
 * built site. One list, so the gate and the module cannot drift apart.
 *
 * Every name but `show_publications` is also a tool of the MCP server in `mcp/`,
 * with the same arguments and the same records.
 */
export const WEBMCP_TOOL_NAMES = [
	'search_publications',
	'get_publication',
	'search_communications',
	'get_communication',
	'search_activities',
	'get_activity',
	'list_research_projects',
	'get_research_project',
	'list_dh_projects',
	'get_dh_project',
	'get_cv',
	'get_citation',
	'show_publications'
] as const;

export type WebMcpToolName = (typeof WEBMCP_TOOL_NAMES)[number];

/** The one tool that changes what the reader sees; every other tool only reads. */
export const WEBMCP_UI_TOOLS: readonly WebMcpToolName[] = ['show_publications'];
