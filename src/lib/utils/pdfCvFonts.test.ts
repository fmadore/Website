import { afterEach, expect, it, vi } from 'vitest';
import { registerCvFonts, CV_FONT_TIMEOUT_MS } from './pdfCvLayout';

afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});
const pdfMock = () => ({ addFileToVFS: vi.fn(), addFont: vi.fn() });

it('registers the complete font set only after every font arrives', async () => {
	const pdf = pdfMock();
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => new Response(new Uint8Array([1, 2, 3])))
	);
	expect(await registerCvFonts(pdf as unknown as import('jspdf').jsPDF)).toBe(true);
	expect(pdf.addFont).toHaveBeenCalledTimes(8);
	expect(pdf.addFileToVFS).toHaveBeenCalledWith('Archivo-Regular.ttf', 'AQID');
});

it('abandons stalled downloads without partially registering fonts', async () => {
	vi.useFakeTimers();
	const pdf = pdfMock();
	const signals: AbortSignal[] = [];
	vi.stubGlobal(
		'fetch',
		vi.fn(
			(_url: string, options: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					const signal = options.signal!;
					signals.push(signal);
					signal.addEventListener(
						'abort',
						() => reject(new DOMException('Aborted', 'AbortError')),
						{ once: true }
					);
				})
		)
	);
	const loaded = registerCvFonts(pdf as unknown as import('jspdf').jsPDF);
	await vi.advanceTimersByTimeAsync(CV_FONT_TIMEOUT_MS);
	expect(await loaded).toBe(false);
	expect(signals.every((signal) => signal.aborted)).toBe(true);
	expect(pdf.addFont).not.toHaveBeenCalled();
	expect(vi.getTimerCount()).toBe(0);
});

it('cancels sibling requests after an HTTP error', async () => {
	const pdf = pdfMock();
	const signals: AbortSignal[] = [];
	vi.stubGlobal(
		'fetch',
		vi.fn(async (_url: string, options: RequestInit) => {
			signals.push(options.signal!);
			return new Response('', { status: 404 });
		})
	);
	expect(await registerCvFonts(pdf as unknown as import('jspdf').jsPDF)).toBe(false);
	expect(signals.every((signal) => signal.aborted)).toBe(true);
	expect(pdf.addFileToVFS).not.toHaveBeenCalled();
});
