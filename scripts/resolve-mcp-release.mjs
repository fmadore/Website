import { appendFileSync, readFileSync } from 'node:fs';
import { resolveReleaseVersion } from './lib/release-version.mjs';
const pkg = JSON.parse(readFileSync('mcp/package.json', 'utf8'));
const version = resolveReleaseVersion(pkg.version, {
	input: process.env.INPUT_VERSION,
	refType: process.env.REF_TYPE,
	refName: process.env.REF_NAME
});
if (process.env.GITHUB_OUTPUT)
	appendFileSync(process.env.GITHUB_OUTPUT, `version=${version}\ntag=mcp-v${version}\n`);
console.log(`Release and bundle version: ${version}`);
