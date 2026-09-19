import { spawnSync } from 'node:child_process';

// Invoke npm's CLI through Node: no shell quoting or Windows .cmd dependency.
if (!process.env.npm_execpath) throw new Error('Run this through npm run verify.');
for (const command of [
	'lint',
	'check',
	'mcp:check',
	'test:coverage',
	'test:lifecycle',
	'check:generated',
	'check:fonts',
	'build',
	'check:build',
	'mcp:smoke',
	'test:e2e'
]) {
	console.log(`\nVerifying: ${command}`);
	const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', command], {
		stdio: 'inherit',
		env: { ...process.env, PLAYWRIGHT_SKIP_BUILD: '1', PLAYWRIGHT_REUSE_SERVER: '0' }
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
