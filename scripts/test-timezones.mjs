import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const vitest = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url));
const files = [
	'src/lib/utils/date-formatter.test.ts',
	'src/lib/utils/citationFormatter.test.ts',
	'src/lib/data/activities/summaries.test.ts'
];
for (const TZ of ['UTC', 'America/Toronto', 'Africa/Johannesburg']) {
	console.log(`Calendar-date regression checks: ${TZ}`);
	const result = spawnSync(process.execPath, [vitest, 'run', ...files], {
		env: { ...process.env, TZ },
		stdio: 'inherit'
	});
	if (result.error) throw result.error;
	if (result.status !== 0) process.exit(result.status ?? 1);
}
