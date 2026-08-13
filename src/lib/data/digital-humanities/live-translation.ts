import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const liveTranslation: DigitalHumanitiesProject = {
	id: 'live-translation',
	title: 'Live Translation and Subtitles',
	years: '2026',
	shortDescription:
		'A lightweight desktop app that captions a room as people speak, either translating into English or French or transcribing the spoken language. Built in Rust and Tauri for a bilingual workshop at STIAS in Stellenbosch.',
	description: `
		<p>A lightweight desktop app that captions a room as people speak. It captures the presenter's microphone or the computer's own audio output, streams it to a realtime speech model, and displays the text in a transparent, always-on-top overlay that can be positioned over the slides.</p>

		<p>I wrote it for the <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/" target="_blank" rel="noopener noreferrer">Digital Humanities and Artificial Intelligence in African Studies</a> <a href="/communications/stias-dh-ai-african-studies-workshop-2026">workshop</a> at the Stellenbosch Institute for Advanced Study, 21–24 September 2026, where papers and discussion run in English and French. The workshop is hybrid, so the app can take the room microphone, the Teams or Zoom feed, or both at once.</p>

		<h3>Two modes</h3>
		<ul>
			<li><strong>Live translation</strong>: Google Gemini or OpenAI detects the spoken language and returns English or French.</li>
			<li><strong>Live subtitles</strong>: Mistral's Voxtral transcribes without translating. The transcript saves as plain text or Markdown.</li>
		</ul>

		<h3>What it costs to run</h3>
		<p>All three providers bill per minute of streamed audio, so a session costs money for as long as it is open. An hour of translation runs to about $1.25–2.21 on Gemini or $3.06 on OpenAI, an hour of subtitles about $0.36. Captioning two audio sources at once doubles those figures. The repository documents the per-minute rates behind them.</p>

		<h3>How it's built</h3>
		<p>A <a href="https://tauri.app/" target="_blank" rel="noopener noreferrer">Tauri</a> app with a Rust core and a <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> front end, in two windows: an operator panel for controls, meters and export, and the click-through caption overlay. Rust handles capture, including WASAPI loopback for system audio on Windows, and the WebSocket session that deals with timeouts, reconnection and stale audio. API keys stay in the operating system's keychain and are read only by the Rust side. The code is <a href="https://github.com/fmadore/Live-translation/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>.</p>
	`,
	imageUrl: '/images/digital-humanities/live-translation.webp',
	order: 2,
	links: [
		{ url: 'https://github.com/fmadore/Live-translation', label: 'Live-translation', type: 'code' },
		{
			url: 'https://fmadore.github.io/stias-dh-ai-workshop-2026/',
			label: 'STIAS workshop website'
		},
		{
			url: 'https://github.com/fmadore/stias-dh-ai-workshop-2026',
			label: 'stias-dh-ai-workshop-2026',
			type: 'code'
		}
	],
	skills: [
		'Rust',
		'Tauri',
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'WebSocket',
		'Real-time Audio',
		'Speech Recognition',
		'Machine Translation',
		'LLM',
		'Accessibility'
	],
	seoKeywords: [
		'live translation',
		'live captions',
		'subtitles',
		'speech translation',
		'realtime speech recognition',
		'conference accessibility',
		'hybrid conference',
		'Tauri',
		'Rust',
		'Gemini',
		'OpenAI',
		'Mistral Voxtral',
		'digital humanities',
		'African studies'
	]
};
