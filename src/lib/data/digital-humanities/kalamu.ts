import type { DigitalHumanitiesProject } from '#lib/types/digitalHumanities.ts';

export const kalamu: DigitalHumanitiesProject = {
	id: 'kalamu',
	title: 'Kalamu',
	years: '2026-',
	shortDescription:
		'A free, open-source app for researchers on Windows and macOS: read scanned and handwritten documents, transcribe interviews and analyse texts with Gemini, OpenAI, Claude or Mistral, or offline with Whisper and local models, and check every result against its source. In the Microsoft Store and, for Mac, on GitHub.',
	description: `
		<p>More and more colleagues ask me how to use AI to transcribe their recordings and read their documents. The <a href="/digital-humanities/iwac-ai-pipelines">Python pipelines</a> behind the Islam West Africa Collection already do this, but they assume some technical comfort: Python, a terminal and a configuration file. Kalamu packages the same workflows as an ordinary desktop app for Windows and macOS. Install it, paste an API key, pick a file or a folder and press Start.</p>

		<p><em>Kalamu</em> is Swahili for pen, from the Arabic <em>qalam</em>. It is in the <a href="https://apps.microsoft.com/detail/9MXT5555BZ1H" target="_blank" rel="noopener noreferrer">Microsoft Store</a> for Windows 11, and a signed and notarised Mac version for Apple Silicon (macOS 14 or later) is on <a href="https://github.com/fmadore/Kalamu/releases" target="_blank" rel="noopener noreferrer">GitHub</a>. The interface is in English and French.</p>

		<h2>What it does</h2>
		<ul>
			<li><strong>Extract text</strong> from PDFs and images, printed or handwritten, with the provider of your choice or offline with Tesseract and small local OCR models, keeping the lines as on the page or joining them into running text</li>
			<li><strong>Transcribe audio and video</strong> with speakers and timestamps, in the cloud or offline with Whisper; public YouTube videos are transcribed from their link</li>
			<li><strong>Analyse texts</strong> with fields you define: a summary, the people, places and organisations a document names, its tone with a reason, themes from your own list, or the question, argument, methods and findings of a scholarly publication</li>
			<li><strong>Translate texts</strong> with the same providers, or offline with a local Gemma model</li>
			<li><strong>Make a detailed table of contents</strong> of a newspaper issue, an archival file scanned in one piece, a book or a report</li>
			<li><strong>Correct existing OCR</strong> page by page, keeping the spelling of the time, with every change shown against the original</li>
			<li><strong>Compare models</strong> on the same documents, their differences highlighted and error rates measured against corrected pages</li>
		</ul>

		<h2>Checked against the source</h2>
		<p>AI output can be fluent and wrong. Every result opens beside its source, page by page or line by line of a recording, and the places where models disagree are highlighted. Corrections are kept apart from the AI's text, which is never overwritten. Each export, from plain text and Word to subtitles and searchable PDF, comes with a <code>provenance.json</code> recording the model, the prompt and the settings, and a job's settings can be saved as a pipeline and exported to cite in a methods section.</p>

		<h2>What it costs to run</h2>
		<p>The app is free, and every feature stays free. Offline work, transcription with Whisper and reading with the local models, costs nothing. The cloud providers bill their own usage to your own key; work is saved piece by piece so nothing is paid for twice, and large collections can go through the providers' batch services at half the price.</p>

		<h2>How it's built</h2>
		<p>A <a href="https://tauri.app/" target="_blank" rel="noopener noreferrer">Tauri</a> app with a Rust engine and a <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a> front end, native on x64 and ARM64 Windows and on Apple Silicon Macs. The prompts, provider clients and provenance format are ported from the Python pipelines, and the app's plumbing (API keys in Windows Credential Manager or the macOS Keychain, the local Whisper engine, store packaging) is shared with <a href="/digital-humanities/live-translation">Live Translation and Subtitles</a>. Files go straight from the computer to the chosen provider; offline, nothing leaves it. The code is <a href="https://github.com/fmadore/Kalamu/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>.</p>
	`,
	imageUrl: '/images/digital-humanities/kalamu.webp',
	order: 1,
	application: {
		status: 'released',
		operatingSystem: 'Windows 11, macOS 14+',
		architectures: ['x64', 'ARM64'],
		licence: 'MIT',
		interfaceLanguages: ['English', 'French']
	},
	links: [
		{
			url: 'https://apps.microsoft.com/detail/9MXT5555BZ1H',
			label: 'Microsoft Store',
			type: 'install'
		},
		{
			url: 'https://github.com/fmadore/Kalamu/releases',
			label: 'GitHub releases',
			type: 'install'
		},
		{ url: 'https://github.com/fmadore/Kalamu', label: 'Kalamu', type: 'code' }
	],
	skills: [
		'Rust',
		'Tauri',
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'LLM',
		'Prompt Engineering',
		'OCR',
		'HTR',
		'Audio Transcription',
		'Whisper',
		'NER',
		'Sentiment Analysis',
		'Reproducible Research'
	],
	seoKeywords: [
		'Kalamu',
		'OCR',
		'handwritten text recognition',
		'HTR',
		'interview transcription',
		'speech to text',
		'Whisper',
		'Gemini',
		'OpenAI',
		'Claude',
		'Mistral',
		'research software',
		'Tauri',
		'Rust',
		'Microsoft Store',
		'Windows',
		'macOS',
		'digital humanities',
		'African studies'
	]
};
