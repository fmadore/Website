import { spawnSync } from 'node:child_process';

// PYTHON selects an existing interpreter on hosts with several installations.
const result = spawnSync(process.env.PYTHON || 'python', ['scripts/subset-fonts.py', '--check'], {
	stdio: 'inherit'
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
