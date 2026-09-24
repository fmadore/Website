import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { COPY_FEEDBACK_MS, createCopyFeedback } from '../src/lib/utils/clipboard.svelte';

let stop: (() => void) | undefined;
beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

/** A document whose selection-copy fallback reports `execResult`. */
function stubDocument(execResult: boolean) {
	const field = { style: {}, setAttribute() {}, select() {}, setSelectionRange() {} };
	vi.stubGlobal('document', {
		activeElement: null,
		createElement: () => field,
		body: { appendChild() {}, removeChild() {} },
		execCommand: () => execResult
	});
}

function setup() {
	let feedback!: ReturnType<typeof createCopyFeedback>;
	stop = $effect.root(() => {
		feedback = createCopyFeedback();
	});
	flushSync();
	return feedback;
}

it('reports a copy, then returns to idle after the feedback window', async () => {
	stubDocument(false);
	const writeText = vi.fn(async () => {});
	vi.stubGlobal('navigator', { clipboard: { writeText } });
	const feedback = setup();
	expect(feedback.state).toBe('idle');

	expect(await feedback.copy('Madore, F. 2021.')).toBe('copied');
	expect(writeText).toHaveBeenCalledWith('Madore, F. 2021.');
	expect(feedback.state).toBe('copied');

	vi.advanceTimersByTime(COPY_FEEDBACK_MS - 1);
	expect(feedback.state).toBe('copied');
	vi.advanceTimersByTime(1);
	expect(feedback.state).toBe('idle');
});

it('reports a refused copy as failed, never as copied', async () => {
	stubDocument(false);
	vi.stubGlobal('navigator', {
		clipboard: { writeText: vi.fn(async () => Promise.reject(new Error('denied'))) }
	});
	const feedback = setup();
	expect(await feedback.copy('text')).toBe('failed');
	expect(feedback.state).toBe('failed');
});

it('restarts the window on a second copy', async () => {
	stubDocument(true);
	vi.stubGlobal('navigator', {});
	const feedback = setup();
	await feedback.copy('first');
	vi.advanceTimersByTime(COPY_FEEDBACK_MS - 100);
	await feedback.copy('second');
	vi.advanceTimersByTime(200);
	expect(feedback.state).toBe('copied');
	vi.advanceTimersByTime(COPY_FEEDBACK_MS);
	expect(feedback.state).toBe('idle');
});

it('clears its pending reset when the owner is destroyed', async () => {
	stubDocument(true);
	vi.stubGlobal('navigator', {});
	const feedback = setup();
	await feedback.copy('text');
	expect(vi.getTimerCount()).toBe(1);
	stop?.();
	stop = undefined;
	expect(vi.getTimerCount()).toBe(0);
});
