# website-mcp

An [MCP](https://modelcontextprotocol.io/) server over the academic record published at
[frederickmadore.com](https://www.frederickmadore.com). Connect it to Claude (or any MCP
client) and ask questions about the publications, talks, research projects, digital
humanities work, and CV instead of browsing for them.

> **What this is not.** This server covers Frédérick Madore's _own_ scholarship. The
> [IWAC](https://islam.zmo.de/s/westafrica/) MCP server covers the West African source
> archive he studies. Different corpora — connect both if you want both.

## Install (Claude Desktop)

Download **`frederickmadore-website.mcpb`** and double-click it. Claude Desktop opens an
install dialog; click Install. That is the whole procedure — no config file to edit, no
terminal, and no need to have Node installed, since Claude Desktop supplies its own
runtime.

The bundle is built by CI on every change: open the latest run under
[Actions](https://github.com/fmadore/Website/actions) and download the `mcpb` artifact. To
build it yourself, see [Commands](#commands) below.

There is one optional setting, **Site address**, in the extension's configuration pane.
Leave it blank unless you are developing against unpublished content.

### Check it works

Ask: _"What has Frédérick Madore published about religious activism on campuses?"_

## Install (other clients)

Anything that speaks MCP over stdio can run the server directly. This path uses the
developer build rather than the bundle, so it needs **Node 24 or newer**.

```bash
git clone https://github.com/fmadore/Website.git
cd Website
npm install          # also builds the server
```

**Claude Code:**

```bash
claude mcp add frederickmadore -- node /absolute/path/to/Website/mcp/dist/index.js
```

**Anything reading `mcpServers` JSON:**

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
| `npm run mcp:build` | Bundle the developer server to `mcp/dist/index.js`                              |
| `npm run mcp:pack`  | Build the installable `mcp/dist/frederickmadore-website.mcpb`                   |
| `npm run mcp:check` | Type-check                                                                      |
| `npm run mcp:smoke` | Build both, then drive each over the protocol against a local build of the site |
| `npm test`          | Unit tests (search and ranking), run with the site's suite                      |

`npm run mcp:smoke` needs `npm run build` at the repo root first. It exercises the
developer build _and_ the server unpacked back out of the `.mcpb` — the artifact people
actually install — because building a bundle is not proof that it boots. CI runs the whole
thing on every pull request, so a renamed API field, a broken tool registration, or a
bundle that fails to start is caught there.

### How the bundle is built

`pack.mjs` inlines every dependency into one minified file (no `node_modules/` to ship),
targets Node 20 rather than 24 since Claude Desktop supplies the runtime, and writes a
`package.json` marking the output as ESM. The manifest's tool list is not hand-written: the
script starts the freshly built server, asks it over the protocol what tools it has, and
writes the answer. A hand-maintained list is a second source of truth that drifts the
moment a tool is renamed.
