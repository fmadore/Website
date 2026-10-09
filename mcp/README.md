# website-mcp

An [MCP](https://modelcontextprotocol.io/) server over the academic record published at
[frederickmadore.com](https://www.frederickmadore.com). Connect it to Claude (or any MCP
client) and ask questions about the publications, talks, research projects, digital
humanities work, and CV instead of browsing for them.

> **What this is not.** This server covers Frédérick Madore's _own_ scholarship. The
> [IWAC](https://islam.zmo.de/s/westafrica/) MCP server covers the West African source
> archive he studies. Different corpora — connect both if you want both.

## Install (Claude Desktop)

Download **`frederickmadore-website.mcpb`** from the
[latest release](https://github.com/fmadore/Website/releases?q=mcp-v) and double-click it.
Claude Desktop opens an install dialog; click Install. That is the whole procedure — no
config file to edit, no terminal, and no need to have Node installed, since Claude Desktop
supplies its own runtime.

Claude Desktop will warn that the publisher is unverified. That is expected and permanent —
see [Why the bundle is unsigned](#why-the-bundle-is-unsigned).

Every commit also builds the bundle: open the latest run under
[Actions](https://github.com/fmadore/Website/actions) and download the `mcpb` artifact if
you want an unreleased build. To build it yourself, see [Commands](#commands) below.

There is one optional setting, **Site address**, in the extension's configuration pane.
Leave it blank unless you are developing against unpublished content.

### Check it works

Ask: _"What has Frédérick Madore published about religious activism on campuses?"_

## Install (other clients)

Anything that speaks MCP over stdio can run the server directly. This path uses the
developer build rather than the bundle, so it needs **Node 20 or newer**.

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
| `search_activities`      | Search news and activity entries, matching against their full body text.                                        |
| `get_activity`           | One activity in full, including its complete body text.                                                         |
| `list_research_projects` | All research projects, each listing the ids of its publications, talks, grants and fieldwork.                   |
| `get_research_project`   | One project in full: its complete narrative, span, regions, source languages, funding, cross-references.        |
| `list_dh_projects`       | Digital archives, datasets and tools, with skills, awards and reviews.                                          |
| `get_dh_project`         | One digital humanities project in full.                                                                         |
| `get_cv`                 | The career record. Optionally one section (`grants`, `teaching`, `awards`, …).                                  |
| `get_citation`           | BibTeX, or a plain-text reference.                                                                              |

Search matches accent-insensitively, so `cote d'ivoire` reaches `Côte d'Ivoire`. `type` and
`country` match a whole value (`Niger` does not reach `Nigeria`, nor `article` a
`bulletin-article`); `tag`, `project` and `language` match any part of one.
Search results are paginated with `limit` and `offset`, and every tool returns both a
readable text block and schema-validated structured content.

The site registers the same twelve tools in the browser for agents visiting it, through
WebMCP (`src/lib/utils/webmcp.ts`). Both read the same API documents through the same
loader, search and citation code in `src/lib/utils/api*.ts`, so the two cannot drift.

Search returns headlines; the `get_*` tools return whole records. Every dataset carries its
full text — publication and talk abstracts, activity bodies, project descriptions, and the
research narratives — so nothing on the site is searchable but unreadable.

## Resources

The same seven API documents are also exposed as MCP resources under `website://api/`:
the discovery manifest, research, publications, communications, activities, digital
humanities projects, and the CV. Tools are the efficient path for filtered questions;
resources are the complete, URI-addressable datasets for clients that want the data plane
directly.

## How it works

The server reads the site's published JSON documents (`/api/*.json`) over HTTP and holds
validated responses in memory for five minutes. Concurrent requests share one fetch, and failed
requests can be retried. There is no database, no search index, and no
data of its own: the corpus is a few hundred records, so a linear scan is cheaper than the
machinery needed to avoid one. The next request after expiry picks up new content.

`WEBSITE_API_TIMEOUT_MS` bounds the complete fetch, including the response body (default
10,000 ms). `WEBSITE_API_CACHE_TTL_MS` sets the cache lifetime (default 300,000 ms). Both
accept milliseconds: the timeout must be positive; a zero TTL disables persistent caching. Incompatible API versions and malformed documents are
rejected before caching.

The server uses the stable TypeScript SDK v2. `serveStdio()` and `createMcpHandler()` serve
both the stateless `2026-07-28` protocol and legacy 2025-era clients from the same server
factory, so the tool and resource surfaces cannot diverge between transports. Modern
`tools/list`, `resources/list`, and `resources/read` responses advertise a one-hour public
cache hint.

### Streamable HTTP

Build and run the stateless remote endpoint locally:

```bash
npm run mcp:build
npm run start:http -w mcp
```

The MCP endpoint is `http://localhost:7860/mcp`; `/` and `/healthz` return a small health
document. Local runs bind to `127.0.0.1`. Set `MCP_BIND_HOST=0.0.0.0` deliberately for
containers or public hosting; Hugging Face Spaces select this automatically when
`SPACE_HOST` is present. `PORT` and `WEBSITE_API_BASE` remain configurable.

Host and Origin guards use the SDK validators. Loopback hostnames and `SPACE_HOST`
are trusted; add comma-separated hostnames (without scheme or port) through
`ALLOWED_HOSTS` and, separately, `ALLOWED_ORIGIN_HOSTS`. The Origin policy is
hostname-based; ports on those trusted hosts are not restricted. Native clients
without Origin are accepted; untrusted, malformed, and null origins are rejected.
Forwarded headers do not override these guards; configure the proxy's actual Host.

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
| `npm run mcp:build` | Build the stdio, HTTP, and shared server bundles in `mcp/dist/`                 |
| `npm run mcp:pack`  | Build the installable `mcp/dist/frederickmadore-website.mcpb`                   |
| `npm run mcp:check` | Type-check                                                                      |
| `npm run mcp:smoke` | Build both, then drive each over the protocol against a local build of the site |
| `npm test`          | Unit tests (search and ranking), run with the site's suite                      |

`npm run mcp:smoke` needs `npm run build` at the repo root first. It exercises the
developer build _and_ the server unpacked back out of the `.mcpb` — the artifact people
actually install — and drives the same factory over stateless Streamable HTTP. Both modern
and legacy protocol eras are covered. CI runs the whole thing on every pull request, so a
renamed API field, a broken tool registration, or a bundle that fails to start is caught
there.

### Releasing

Push a tag, or use Actions → **Release MCP bundle** → Run workflow:

```bash
git tag mcp-v0.3.0 && git push origin mcp-v0.3.0
```

The workflow type-checks, builds the site, builds and smoke-tests the bundle against real
API documents, and only then publishes it as a release asset. Nothing ships that has not
booted.

### Publishing to the MCP Registry

[`server.json`](server.json) is the server's entry for the official
[MCP Registry](https://modelcontextprotocol.io/registry/about) (in preview), as
`io.github.fmadore/frederickmadore-website`. The registry stores metadata only: the entry
points at the release's `.mcpb` and records its SHA-256, which clients check before
installing. The committed file describes the latest release, `0.3.0`.

The hash must be the hash of the uploaded file. The bundle is a zip with build timestamps,
so a local rebuild of the same commit hashes differently. The release workflow therefore
stamps `server.json` for the bundle it publishes (`scripts/stamp-mcp-registry.mjs`) and
attaches it to the same release. Publishing stays manual, and needs a GitHub sign-in as
`fmadore`:

1. Release as above, then fetch that release's entry (here `0.3.0`):

   ```bash
   gh release download mcp-v0.3.0 --repo fmadore/Website --pattern server.json --dir mcp --clobber
   ```

   To republish `0.3.0`, skip this step: the committed file is already its entry.

2. Install `mcp-publisher` from the
   [registry's releases](https://github.com/modelcontextprotocol/registry/releases) (the
   [quickstart](https://modelcontextprotocol.io/registry/quickstart) has one-line installs
   for each platform, including Windows on ARM).

3. From `mcp/`, check the entry, sign in, and publish:

   ```bash
   mcp-publisher validate
   mcp-publisher login github
   mcp-publisher publish
   ```

   `validate` sends the file to the registry's validation endpoint; `login github` opens
   GitHub's device flow; `publish` reads `./server.json`. The registry token that
   `login` stores expires within minutes, so run `publish` straight after it; a
   `401 … token is expired` means log in again.

4. Confirm the listing, then commit the fetched `server.json`, so the repo records what was
   published:

   ```bash
   curl "https://registry.modelcontextprotocol.io/v0.1/servers?search=io.github.fmadore/frederickmadore-website"
   ```

`npm test` checks the committed entry against the registry's limits (`scripts/mcp-registry.test.mjs`).
The step could later run in `release-mcp.yml` through `mcp-publisher login github-oidc`, which
needs `id-token: write` and no stored secret.

### Why the bundle is unsigned

Claude Desktop warns that the publisher is unverified. That is deliberate and will not
change.

`mcpb` verifies a signature by shelling out to the OS trust store — `security verify-cert
-p codeSign` on macOS, the PowerShell equivalent on Windows — so only a certificate issued
by a recognised CA clears the warning. Those cost money annually and require validating
your identity; this project does not buy one.

`mcpb sign --self-signed` is not a workaround. A certificate chaining to nothing trusted
verifies as `unsigned`, so the file gains ~2 KB and nothing else — including in Claude
Desktop, which uses this same verification code. An honest unsigned bundle is better than
a signature the loader ignores.

### How the bundle is built

`pack.mjs` inlines every dependency into one minified file (no `node_modules/` to ship),
targets Node 20 rather than 24 since Claude Desktop supplies the runtime, and writes a
`package.json` marking the output as ESM. The manifest's tool list is not hand-written: the
script starts the freshly built server, asks it over the protocol what tools it has, and
writes the answer. A hand-maintained list is a second source of truth that drifts the
moment a tool is renamed.

The archive is written with `fflate` directly rather than through the `@anthropic-ai/mcpb`
CLI. That CLI packs with exactly this call — `zipSync` at level 9, Unix mode bits in the
external attributes — but it also pulls in `@inquirer/prompts` for its interactive `init`
wizard, and with it a `tmp` carrying two unfixed high-severity advisories. Nothing here
runs `init`, so that was 171 packages and a failing `npm audit` in exchange for one
`zipSync` call. Manifest validation is a short required-field check in `pack.mjs`, which is
the part that matters for a manifest generated from a fixed template.
