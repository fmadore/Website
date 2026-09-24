/**
 * The last step every committed-projection generator shares: write the
 * generated modules, or — under `--check`, which is how CI and `npm run
 * check:generated` run them — compare each with the committed copy and report
 * the ones that drifted.
 *
 * It was five hand-copied tails, and they had drifted themselves: one read the
 * committed file without a guard, so a missing file crashed `--check` with a
 * stack trace instead of reporting it stale.
 */
import { readFileSync, writeFileSync } from 'node:fs';

/** `--check`: verify the committed files instead of writing them. */
export const CHECK_MODE = process.argv.includes('--check');

/** The committed file's text, or null when it does not exist. */
function readCommitted(file) {
	try {
		return readFileSync(file, 'utf8');
	} catch {
		return null;
	}
}

/**
 * The files in `outputs` ([path, generated text] pairs) whose committed copy
 * differs from what was generated. A missing file counts as stale.
 */
export function staleOutputs(outputs, read = readCommitted) {
	return outputs.filter(([file, output]) => read(file) !== output).map(([file]) => file);
}

/**
 * Write each generated file — or, in check mode, report each stale one under
 * `tag` with the `command` that regenerates it. Returns whether the committed
 * files are current (always true after a write), so a caller ends with
 * `if (!emitGenerated(…)) process.exit(1)`.
 */
export function emitGenerated(outputs, { tag, command }) {
	if (!CHECK_MODE) {
		for (const [file, output] of outputs) writeFileSync(file, output, 'utf8');
		return true;
	}
	const stale = staleOutputs(outputs);
	for (const file of stale) {
		console.error(
			`[${tag}] ERROR: ${file} is stale (or missing). Run \`${command}\` and commit the result.`
		);
	}
	return stale.length === 0;
}
