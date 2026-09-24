import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';
import { useGtm } from '../src/lib/utils/gtm.svelte';

const GTM_ID = 'G-TEST';
let stop: (() => void) | undefined;
let appendChild: ReturnType<typeof vi.fn>;

type TestWindow = EventTarget &
	Pick<Window, 'dataLayer' | 'gtag'> & { location: Partial<Location> };

beforeEach(() => {
	vi.useFakeTimers();
	appendChild = vi.fn();
	vi.stubGlobal('document', {
		title: 'Publications',
		head: { appendChild },
		createElement: () => ({})
	});
	stubWindow('www.frederickmadore.com');
});
afterEach(() => {
	stop?.();
	stop = undefined;
	vi.useRealTimers();
	vi.unstubAllGlobals();
});

function stubWindow(hostname: string): TestWindow {
	const target = Object.assign(new EventTarget(), {
		location: {
			hostname,
			href: `https://${hostname}/publications`,
			pathname: '/publications'
		}
	}) as TestWindow;
	vi.stubGlobal('window', target);
	return target;
}

function setup() {
	let tracker!: ReturnType<typeof useGtm>;
	stop = $effect.root(() => {
		tracker = useGtm(GTM_ID);
	});
	flushSync();
	return tracker;
}

/** The gtag calls queued so far, as plain arrays. */
function queued(): unknown[][] {
	return (window.dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

const pageViews = () =>
	queued().filter(([command, name]) => command === 'event' && name === 'page_view');

it('waits five seconds for an interaction, then loads once', () => {
	setup();
	vi.advanceTimersByTime(4999);
	expect(appendChild).not.toHaveBeenCalled();
	vi.advanceTimersByTime(1);
	expect(appendChild).toHaveBeenCalledTimes(1);
	expect(appendChild.mock.calls[0]?.[0]).toMatchObject({
		async: true,
		src: `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`
	});
	expect(queued().map(([command]) => command)).toEqual(['js', 'config', 'event']);
	// The initial view is sent by hand, so gtag must not send its own as well.
	expect(queued()[1]).toEqual([
		'config',
		GTM_ID,
		expect.objectContaining({ send_page_view: false, anonymize_ip: true })
	]);
	expect(pageViews()[0]?.[2]).toEqual({
		page_title: 'Publications',
		page_location: 'https://www.frederickmadore.com/publications',
		page_path: '/publications'
	});
});

it('loads on the first interaction and cancels the fallback', () => {
	setup();
	window.dispatchEvent(new Event('scroll'));
	expect(appendChild).toHaveBeenCalledTimes(1);
	expect(vi.getTimerCount()).toBe(0);
	window.dispatchEvent(new Event('mousemove'));
	vi.advanceTimersByTime(10_000);
	expect(appendChild).toHaveBeenCalledTimes(1);
});

it('tracks client-side page views only once loaded', () => {
	const { trackPageView } = setup();
	trackPageView();
	expect(window.dataLayer).toBeUndefined();
	window.dispatchEvent(new Event('touchstart'));
	expect(pageViews()).toHaveLength(1);
	trackPageView();
	expect(pageViews()).toHaveLength(2);
});

it('configures but never reports page views on localhost', () => {
	stubWindow('localhost');
	const { trackPageView } = setup();
	vi.advanceTimersByTime(5000);
	expect(queued().map(([command]) => command)).toEqual(['js', 'config']);
	trackPageView();
	expect(pageViews()).toHaveLength(0);
});

it('loads nothing once its owner is destroyed', () => {
	setup();
	stop?.();
	stop = undefined;
	expect(vi.getTimerCount()).toBe(0);
	window.dispatchEvent(new Event('scroll'));
	vi.advanceTimersByTime(5000);
	expect(appendChild).not.toHaveBeenCalled();
});
