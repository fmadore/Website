import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

export const liveTranslation: DigitalHumanitiesProject = {
	id: 'live-translation',
	title: 'Live Translation and Subtitles',
	years: '2026',
	shortDescription:
		'A Windows app that puts live captions and translations over meetings, video calls and slides, offline with Whisper or through Gemini, OpenAI and Mistral. Built for a bilingual workshop at STIAS, now in the Microsoft Store.',
	description: `
		<p>A desktop app that captions a room as people speak. It listens to a microphone, the computer's own sound or a single application such as Teams or Zoom, and shows the words in a transparent overlay that sits over the slides or the call, always on top and out of the mouse's way.</p>

		<p>I first wrote it for the <a href="https://fmadore.github.io/stias-dh-ai-workshop-2026/" target="_blank" rel="noopener noreferrer">Digital Humanities and Artificial Intelligence in African Studies</a> <a href="/communications/stias-dh-ai-african-studies-workshop-2026">workshop</a> at the Stellenbosch Institute for Advanced Study, 21–24 September 2026, where papers and discussion ran in English and French and part of the audience joined online. It has since grown into a general tool, published in the <a href="https://apps.microsoft.com/detail/9PFB8LR3RR9X" target="_blank" rel="noopener noreferrer">Microsoft Store</a> for Windows 11, with an interface in English, French and German.</p>

		<h2>What it does</h2>
		<ul>
			<li><strong>Offline subtitles</strong>: Whisper runs on your own computer in 99 languages, with no account, API key or internet connection, and the audio never leaves the machine</li>
			<li><strong>Offline translation into English</strong>, with the same Whisper models</li>
			<li><strong>Cloud translation</strong> through Google Gemini, into 78 languages, or OpenAI; Gemini and Mistral also offer same-language subtitles</li>
			<li><strong>Bilingual audiences</strong>: two translation languages at once, or the original speech beneath the translation</li>
			<li><strong>Readable captions</strong>: adjustable font, size, colour, contrast and reading pace, right-to-left scripts included</li>
			<li><strong>A transcript to keep</strong>, as text, Markdown, or SRT and WebVTT subtitle files</li>
		</ul>

		<h2>What it costs to run</h2>
		<p>Captioning with Whisper is free. The cloud services use your own account and bill per minute of streamed audio, so a session costs money for as long as it is open: roughly $1–3 an hour for translation and under $1 for subtitles. The repository documents the rates behind those figures.</p>

		<h2>How it's built</h2>
		<p>A <a href="https://tauri.app/" target="_blank" rel="noopener noreferrer">Tauri</a> app with a Rust core and a <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> front end, native on both x64 and ARM64 Windows. Rust handles audio capture, the local Whisper engine and the streaming connections to the cloud services, including timeouts and reconnection. API keys stay in Windows Credential Manager, and no audio, transcript or usage data ever reaches me. The code is <a href="https://github.com/fmadore/Live-translation/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>.</p>
	`,
	imageUrl: '/images/digital-humanities/live-translation.webp',
	order: 2,
	links: [
		{ url: 'https://apps.microsoft.com/detail/9PFB8LR3RR9X', label: 'Microsoft Store' },
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
		'Whisper',
		'Machine Translation',
		'LLM',
		'Accessibility',
		'Internationalisation'
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
		'Whisper',
		'offline transcription',
		'Microsoft Store',
		'Windows',
		'digital humanities',
		'African studies'
	]
};
