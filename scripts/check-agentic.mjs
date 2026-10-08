/**
 * Lighthouse's Agentic Browsing category, asserted on the production build.
 *
 * PageSpeed Insights reports this category, but `@lhci/cli` (0.15.1) bundles
 * Lighthouse 12, which predates it, so `lighthouserc.yml` cannot assert it.
 * This runs the Lighthouse CLI itself, pinned below, against `build/` served by
 * `serve` the way `check:lighthouse` and the E2E suite serve it.
 *
 * Chrome exposes WebMCP (`document.modelContext`) only to pages carrying the
 * origin-trial token, or with `--enable-experimental-web-platform-features`.
 * The flag is passed here so the gate does not depend on the token: a missing
 * or expired token would otherwise turn every WebMCP audit "not applicable"
 * and the category would still score 1, which is how the six tools first
 * shipped invisible to stock Chrome without anything failing.
 *
 * Per page, the run fails unless:
 *   - the category scores 1;
 *   - `webmcp-registered-tools` is applicable and lists exactly the tools in
 *     `src/lib/utils/webmcpToolNames.ts`, each with a description;
 *   - `webmcp-schema-validity`, `llms-txt` and `agent-accessibility-tree` are
 *     applicable and score 1.
 *
 * Usage: npm run build && npm run check:agentic
 *   CHROME_PATH=…   Chrome to drive (default: the one chrome-launcher finds)
 *   --keep          leave the JSON reports in .lighthouse-agentic/
 *
 * On Windows the CLI writes its report and then exits 1 on chrome-launcher's
 * temp-dir cleanup (EPERM); a report on disk is what counts, so that exit code
 * is ignored when the report exists. CI runs on Linux and is unaffected.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { WEBMCP_TOOL_NAMES } from '../src/lib/utils/webmcpToolNames.ts';

/** Pinned: the version PageSpeed Insights ran when this gate was written (2026-10). */
const LIGHTHOUSE = 'lighthouse@13.5.0';
const PORT = 4174;
const ORIGIN = `http://localhost:${PORT}`;
/** One per template that registers the tools differently: none do, so three suffice. */
const PAGES = ['/', '/publications', '/publications/religious-activism-campuses'];
const CHROME_FLAGS = [
	'--headless=new',
	'--enable-experimental-web-platform-features',
	// Chrome refuses to start as root (containers) without it; a no-op on runners.
	'--no-sandbox'
];
const MUST_PASS = ['webmcp-schema-validity', 'llms-txt', 'agent-accessibility-tree'];
const RUN_TIMEOUT_MS = 240_000;

const keep = process.argv.includes('--keep');
const outDir = resolve('.lighthouse-agentic');
const isWindows = process.platform === 'win32';

if (!existsSync('build/index.html')) {
	console.error('[agentic] No build/ — run `npm run build` first.');
	process.exit(1);
}

/** `npx` is a .cmd shim on Windows, which only a shell can start. */
const quote = (arg) => (/[\s"&|<>^]/.test(arg) ? `"${arg.replaceAll('"', '\\"')}"` : arg);

function run(command, args, { timeoutMs } = {}) {
	return new Promise((done) => {
		// Node 24 refuses an argument list alongside `shell` (DEP0190), so the
		// Windows branch joins the command line itself.
		const child = isWindows
			? spawn([command, ...args].map(quote).join(' '), { shell: true, stdio: 'inherit' })
			: spawn(command, args, { stdio: 'inherit' });
		const timer =
			timeoutMs &&
			setTimeout(() => {
				console.error(`[agentic] ${command} timed out after ${timeoutMs / 1000}s`);
				stop(child);
			}, timeoutMs);
		child.on('exit', (code) => {
			if (timer) clearTimeout(timer);
			done(code ?? 1);
		});
	});
}

function stop(child) {
	if (child.exitCode !== null) return;
	// A shell's child outlives `kill()` on Windows; take the whole tree down.
	if (isWindows) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
	else child.kill();
}

/** `serve`, started by path so it is our own child and dies with us. */
function startServer() {
	const require = createRequire(import.meta.url);
	const pkg = require.resolve('serve/package.json');
	const main = join(dirname(pkg), require(pkg).bin.serve);
	return spawn(process.execPath, [main, 'build', '--listen', String(PORT), '--no-port-switching'], {
		stdio: 'ignore'
	});
}

async function waitForServer() {
	for (let attempt = 0; attempt < 100; attempt += 1) {
		try {
			if ((await fetch(ORIGIN)).ok) return;
		} catch {
			// not up yet
		}
		await new Promise((r) => setTimeout(r, 200));
	}
	throw new Error(`serve did not answer on ${ORIGIN}`);
}

/** Every `tool` cell in the audit's tables, wherever the list nests them. */
function listedTools(details) {
	const rows = [];
	const walk = (node) => {
		if (!node || typeof node !== 'object') return;
		if (Array.isArray(node)) return node.forEach(walk);
		if (typeof node.tool === 'string') rows.push(node);
		Object.values(node).forEach(walk);
	};
	walk(details);
	return rows;
}

function assertReport(lhr) {
	const failures = [];
	const audit = (id) => lhr.audits[id];
	const applicable = (id) =>
		audit(id) && !['notApplicable', 'error'].includes(audit(id).scoreDisplayMode);

	const category = lhr.categories['agentic-browsing'];
	if (!category) failures.push('the agentic-browsing category is missing from the report');
	else if (category.score !== 1)
		failures.push(
			`category scored ${category.score}: ` +
				category.auditRefs
					.filter((ref) => ref.weight > 0 && audit(ref.id)?.score !== 1 && applicable(ref.id))
					.map((ref) => `${ref.id} = ${audit(ref.id).score}`)
					.join(', ')
		);

	if (!applicable('webmcp-registered-tools')) {
		failures.push(
			'webmcp-registered-tools is not applicable: this Chrome exposes no document.modelContext ' +
				'(too old for WebMCP, or the experimental flag did not reach it)'
		);
	} else {
		const rows = listedTools(audit('webmcp-registered-tools').details);
		const names = rows.map((row) => row.tool);
		const missing = WEBMCP_TOOL_NAMES.filter((name) => !names.includes(name));
		const extra = names.filter((name) => !WEBMCP_TOOL_NAMES.includes(name));
		if (missing.length) failures.push(`tools not registered: ${missing.join(', ')}`);
		if (extra.length) failures.push(`unexpected tools: ${extra.join(', ')}`);
		const undescribed = rows.filter((row) => !String(row.description ?? '').trim());
		if (undescribed.length)
			failures.push(`tools without a description: ${undescribed.map((r) => r.tool).join(', ')}`);
		for (const warning of audit('webmcp-registered-tools').warnings ?? [])
			failures.push(`webmcp-registered-tools warns: ${warning}`);
	}

	for (const id of MUST_PASS) {
		if (!applicable(id)) failures.push(`${id} is not applicable`);
		else if (audit(id).score !== 1)
			failures.push(`${id} scored ${audit(id).score}${explain(audit(id))}`);
	}
	return failures;
}

const explain = (audit) =>
	audit.explanation
		? ` (${audit.explanation})`
		: audit.displayValue
			? ` (${audit.displayValue})`
			: '';

// ------------------------------------------------------------------------------

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const server = startServer();
let failed = 0;
try {
	await waitForServer();
	for (const path of PAGES) {
		const url = `${ORIGIN}${path}`;
		const report = join(
			outDir,
			`${path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'}.json`
		);
		console.log(`\n[agentic] ${url}`);
		const code = await run(
			'npx',
			[
				'--yes',
				LIGHTHOUSE,
				url,
				'--only-categories=agentic-browsing',
				'--output=json',
				`--output-path=${report}`,
				`--chrome-flags=${CHROME_FLAGS.join(' ')}`,
				'--quiet'
			],
			{ timeoutMs: RUN_TIMEOUT_MS }
		);
		if (!existsSync(report)) {
			console.error(`[agentic] FAIL ${path}: Lighthouse exited ${code} without a report`);
			failed += 1;
			continue;
		}
		if (code !== 0 && !isWindows) {
			console.error(`[agentic] FAIL ${path}: Lighthouse exited ${code}`);
			failed += 1;
			continue;
		}
		const lhr = JSON.parse(await readFile(report, 'utf8'));
		const failures = lhr.runtimeError
			? [`runtime error: ${lhr.runtimeError.message}`]
			: assertReport(lhr);
		const tools = listedTools(lhr.audits['webmcp-registered-tools']?.details).length;
		if (failures.length === 0) {
			console.log(
				`[agentic] OK   ${path}: category 1, ${tools} WebMCP tools, ` +
					`schemas valid, llms.txt and accessibility tree pass (Lighthouse ${lhr.lighthouseVersion}, Chrome ${lhr.environment?.hostUserAgent?.match(/Chrome\/([\d.]+)/)?.[1] ?? '?'})`
			);
		} else {
			failed += 1;
			for (const failure of failures) console.error(`[agentic] FAIL ${path}: ${failure}`);
		}
	}
} finally {
	stop(server);
	if (!keep) await rm(outDir, { recursive: true, force: true });
}

if (failed > 0) {
	console.error(`\n[agentic] ${failed} of ${PAGES.length} pages failed.`);
	process.exit(1);
}
console.log(`\n[agentic] OK — all ${PAGES.length} pages pass the Agentic Browsing category.`);
