# website-mcp

An [MCP](https://modelcontextprotocol.io/) server over the academic record published at
[frederickmadore.com](https://www.frederickmadore.com). Connect it to Claude (or any MCP
client) and ask questions about the publications, talks, research projects, digital
humanities work, and CV instead of browsing for them.

> **What this is not.** This server covers Frédérick Madore's _own_ scholarship. The
> [IWAC](https://islam.zmo.de/s/westafrica/) MCP server covers the West African source
> archive he studies. Different corpora — connect both if you want both.

## Setup

Requires **Node 24 or newer**.

```bash
git clone https://github.com/fmadore/Website.git
cd Website
npm install          # also builds the MCP server
```

Then add it to your MCP client, using the **absolute path** to the built file.

### Claude Desktop

Edit `claude_desktop_config.json` — Settings → Developer → Edit Config:

```json
{
	"mcpServers": {
		"frederickmadore": {
			"command": "node",
			"args": ["/absolute/path/to/Website/mcp/dist/index.js"]
		}
	}
}
```

Restart Claude Desktop. The tools appear under the connectors icon.

### Claude Code

```bash
claude mcp add frederickmadore -- node /absolute/path/to/Website/mcp/dist/index.js
```

### Check it works

Ask: _"What has Frédérick Madore published about religious activism on campuses?"_

## Tools

| Tool                     | What it does                                                                                                    |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `search_publications`    | Search books, articles, chapters, reports, theses. Filter by type, tag, country, project, language, year range. |
| `get_publication`        | One publication in full — abstract, DOI/ISBN/ISSN, table of contents, citing works, published reviews.          |
| `search_communications`  | Search conference papers, lectures, seminars, workshops, panels, podcasts.                                      |
| `get_communication`      | One talk in full, including panel programmes and participants.                                                  |
| `search_activities`      | Search news and activity entries. These carry their full body text.                                             |
| `list_research_projects` | All research projects, each listing the ids of its publications, talks, grants and fieldwork.                   |
| `get_research_project`   | One project: span, regions, source languages, funding, cross-references.                                        |
| `list_dh_projects`       | Digital archives, datasets and tools, with skills, awards and reviews.                                          |
| `get_dh_project`         | One digital humanities project in full.                                                                         |
| `get_cv`                 | The career record. Optionally one section (`grants`, `teaching`, `awards`, …).                                  |
| `get_citation`           | BibTeX, or a plain-text reference.                                                                              |

Search matches accent-insensitively, so `cote d'ivoire` reaches `Côte d'Ivoire`.

## How it works

The server reads the site's published JSON documents (`/api/*.json`) over HTTP and holds
them in memory for the life of the process. There is no database, no search index, and no
data of its own: the corpus is a few hundred records, so a linear scan is cheaper than the
machinery needed to avoid one. Restart the server to pick up new content.

`get_citation` is not reimplemented here — the build aliases `$lib` and bundles the site's
own `bibtexGenerator` and `citationFormatter`, so the BibTeX this returns is byte-identical
to the site's download button. Only BibTeX and a plain reference are offered because those
are the only formats the site itself generates; adding APA/MLA/Chicago is a change to
`src/lib/utils`, after which it lands here for free.

### Developing against unpublished content

Point the server at a local build instead of the live site:

```bash
npm run build            # at the repo root, produces build/api/*.json
npm run preview          # serves it on :4173
WEBSITE_API_BASE=http://localhost:4173 node mcp/dist/index.js
```

### Commands

| Command             | What it does                                                                    |
| ------------------- | ------------------------------------------------------------------------------- |
| `npm run mcp:build` | Bundle the server to `mcp/dist/index.js`                                        |
| `npm run mcp:check` | Type-check                                                                      |
| `npm run mcp:smoke` | End-to-end test: drives the real server over the protocol against a local build |
| `npm test`          | Unit tests (search and ranking), run with the site's suite                      |

`npm run mcp:smoke` needs `npm run build` at the repo root first. CI runs it on every pull
request, so a renamed API field or a broken tool registration fails there.
