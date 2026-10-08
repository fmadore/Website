/**
 * Stamps `mcp/server.json` with the release a built bundle belongs to: the
 * version from `mcp/package.json`, the GitHub Release URL, and the SHA-256 of
 * the bundle's bytes.
 *
 * Run on the exact file that is uploaded. The bundle is a zip with build
 * timestamps in it, so a rebuild of the same commit hashes differently; that is
 * why `release-mcp.yml` stamps the bundle it is about to publish and attaches
 * the result to the same release. Publishing to the registry stays a manual
 * step (mcp/README.md, "Publishing to the MCP Registry").
 *
 * Usage: node scripts/stamp-mcp-registry.mjs mcp/dist/frederickmadore-website.mcpb
 */
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import * as prettier from 'prettier';
import { serverJsonProblems, stampServerJson } from './lib/mcp-registry.mjs';

const bundlePath = process.argv[2];
if (!bundlePath) {
	console.error('Usage: node scripts/stamp-mcp-registry.mjs <bundle.mcpb>');
	process.exit(1);
}

const target = 'mcp/server.json';
const { version } = JSON.parse(readFileSync('mcp/package.json', 'utf8'));
const sha256 = createHash('sha256').update(readFileSync(bundlePath)).digest('hex');
const server = stampServerJson(JSON.parse(readFileSync(target, 'utf8')), { version, sha256 });

const problems = serverJsonProblems(server);
if (problems.length > 0) {
	for (const problem of problems) console.error(`server.json: ${problem}`);
	process.exit(1);
}

// Formatted as `npm run format` would, so the stamped file can be committed as is.
const options = (await prettier.resolveConfig(target)) ?? {};
writeFileSync(
	target,
	await prettier.format(JSON.stringify(server), { ...options, filepath: target })
);

console.log(`${target}: ${server.name}@${version}`);
console.log(`  ${server.packages[0].identifier}`);
console.log(`  sha256 ${sha256}`);
if (process.env.GITHUB_STEP_SUMMARY)
	appendFileSync(
		process.env.GITHUB_STEP_SUMMARY,
		`### MCP Registry entry\n\n\`${server.name}\` ${version}, bundle SHA-256 \`${sha256}\`.\n` +
			'`server.json` is attached to the release; publish it with `mcp-publisher publish`.\n'
	);
