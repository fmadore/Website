<script lang="ts">
	import ResearchProjectLayout from '$lib/components/research/ResearchProjectLayout.svelte';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
</script>

<ResearchProjectLayout
	title="Digital Humanities and Artificial Intelligence in African Studies"
	shortTitle="Digital Humanities and AI in African Studies"
	slug="dh-ai-african-studies"
	years="2025-"
	imageSrc="IWAC.webp"
	imageAlt="Digital Humanities and AI in African Studies"
	seoDescription="Exploring how digital humanities and artificial intelligence can transform knowledge production in African studies through ethical, sustainable, and Africa-centred digital infrastructures."
	seoKeywords="digital humanities, artificial intelligence, African studies, AI, DH, African epistemologies, Islam West Africa Collection, IWAC, LLM, OCR, NER, vibe coding"
	projectName="Digital Humanities and AI in African Studies"
>
	<p>
		The convergence of digital humanities (DH) and artificial intelligence (AI) is transforming the way knowledge is produced in African studies. This intersection provides unparalleled opportunities to reimagine cultural heritage, expand access to diverse narratives, and amplify marginalised voices. This research agenda navigates this rapidly evolving landscape by examining how scholars can do more than simply digitise archives, and address the structural inequalities inherent in global knowledge systems. As the field approaches an AI-driven "tipping point", the project will explore methods for designing, evaluating and sustaining digital infrastructures. Crucially, these systems must be based on African epistemologies, rather than simply retrofitting Western paradigms to local contexts.
	</p>

	<p>
		These critical enquiries form the basis of a collaborative research initiative comprising two workshops in 2026 <ItemReference id="volkswagenstiftung-dh-ai-african-studies-workshop-2026" /> <ItemReference id="stias-dh-ai-african-studies-workshop-2026" /> and an upcoming co-edited volume entitled <em>Digital Humanities and Artificial Intelligence in African Studies</em>, to be published by Bielefeld University Press. Bringing together scholars and practitioners from Africa, Europe and beyond, the project facilitates essential dialogue between the Global North and South. The initiative interrogates three interconnected themes: transforming research methods through computational tools, building sustainable infrastructures in resource-constrained settings, and centring African knowledge systems in digital design. By shifting the focus from abstract policy governance to "practising with AI", this work charts pathways for the ethical development of DH across the continent.
	</p>
	<p>
		My contribution addresses the practical "problem of scale" in African digital collections. Charting my evolution from "digital hoarder" to "historian-programmer," I explore the democratising potential of "vibe coding" by using natural language prompts to generate executable code. I contend that pipelines utilising Large Language Models (LLMs) can efficiently streamline labour-intensive processes such as optical character recognition (OCR) and named entity recognition (NER). By developing these <a
			href="https://github.com/fmadore/iwac-ai-pipelines"
			target="_blank"
			rel="noopener noreferrer">Python-based workflows</a>, I show how vast, under-resourced collections can be made more accessible. This AI-assisted approach transforms static archives into dynamic, <a
			href="https://fmadore.github.io/iwac-dashboard/"
			target="_blank"
			rel="noopener noreferrer">interactive visualisations</a>, ranging from <a
			href="https://fmadore.github.io/IWAC-spatial-overview/"
			target="_blank"
			rel="noopener noreferrer">network maps</a> to word clouds, that facilitate independent hypothesis testing and cross-disciplinary dialogue.
	</p>

	<p>
		These methodological innovations have been prototyped within the <a
			href="https://islam.zmo.de/s/westafrica/"
			target="_blank"
			rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a>, with its 28-million-word corpus serving as a testing ground for the limits of AI in historical research <ItemReference id="zmo-kitchen-talks-ai-islamic-african-studies" />. Embracing Moretti's (2000) concept of "<a
			href="https://newleftreview.org/issues/ii1/articles/franco-moretti-conjectures-on-world-literature"
			target="_blank"
			rel="noopener noreferrer">distant reading</a>", I posit AI not as a replacement for human judgement, but as a "co-intelligence" (<a
			href="https://www.penguinrandomhouse.com/books/741805/co-intelligence-by-ethan-mollick/"
			target="_blank"
			rel="noopener noreferrer">Mollick, 2024</a>) that can navigate corpora which are too large to read in their entirety. For example, I use AI-powered sentiment analysis to investigate how Islam and Muslims are represented in Francophone West African newspapers, with the results visualised in an <a
			href="https://fmadore.github.io/IWAC-sentiment-analysis/"
			target="_blank"
			rel="noopener noreferrer">interactive dashboard</a>. Ultimately, this research suggests that AI is not a replacement for human judgement, but rather a pragmatic and scalable solution for processing the vast amount of digital material that will define the future of African history.
	</p>

	<RelevantGrants projectName="Digital Humanities and AI in African Studies" />
</ResearchProjectLayout>
