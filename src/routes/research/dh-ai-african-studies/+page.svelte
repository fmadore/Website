<script lang="ts">
	import ResearchProjectLayout from '$lib/components/research/ResearchProjectLayout.svelte';
	import { researchProject } from '$lib/data/research';
	import RelevantGrants from '$lib/components/panels/RelevantGrants.svelte';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
</script>

<ResearchProjectLayout {...researchProject('dh-ai-african-studies')}>
	<p>
		Digital humanities (DH) and artificial intelligence (AI) are changing how knowledge is produced
		in African studies. They make new kinds of analysis possible, and new narratives with them:
		reimagining cultural heritage, widening access to diverse sources, amplifying marginalised
		voices. As the field approaches an AI-driven “tipping point”, the project explores methods for
		designing, evaluating and sustaining digital infrastructures. These systems need to be grounded
		in African epistemologies rather than retrofitted from Western models.
	</p>

	<p>
		These questions run through a collaborative initiative: two workshops in 2026 <ItemReference
			id="volkswagenstiftung-dh-ai-african-studies-workshop-2026"
		/>
		<ItemReference id="stias-dh-ai-african-studies-workshop-2026" /> and a co-edited volume,
		<em>Digital Humanities and Artificial Intelligence in African Studies</em>, to be published by
		Bielefeld University Press. The project brings together scholars and practitioners from Africa,
		Europe and beyond, and opens dialogue between the Global North and South. Three themes organise
		the work: transforming research methods through computational tools, building sustainable
		infrastructures in resource-constrained settings, and centring African knowledge systems in
		digital design. The move is from policy governance about AI to “practising with AI”, and towards
		the ethical development of DH across the continent.
	</p>
	<p>
		My contribution addresses the practical “problem of scale” in African digital collections.
		Tracing my own route from “digital hoarder” to “historian-programmer”, I explore how far agentic
		coding lowers the barrier to entry: the researcher specifies a problem in natural language, and
		an AI agent writes, runs and debugs the code. Pipelines built on large language models (LLMs)
		take over labour-intensive work such as optical character recognition (OCR) and named entity
		recognition (NER). These <a
			href="https://github.com/fmadore/iwac-ai-pipelines"
			target="_blank"
			rel="noopener noreferrer">Python-based workflows</a
		>
		open up vast, under-resourced collections. The same approach turns a static archive into
		<a
			href="https://islam.zmo.de/s/westafrica/page/explore"
			target="_blank"
			rel="noopener noreferrer">interactive visualisations</a
		>:
		<a
			href="https://islam.zmo.de/s/westafrica/page/entity-networks"
			target="_blank"
			rel="noopener noreferrer">networks of who appears alongside whom</a
		>,
		<a
			href="https://islam.zmo.de/s/westafrica/page/words-over-time"
			target="_blank"
			rel="noopener noreferrer">word frequencies traced year by year</a
		>,
		<a
			href="https://islam.zmo.de/s/westafrica/page/topic-modelling"
			target="_blank"
			rel="noopener noreferrer">a semantic map that places 12,000 articles by textual similarity</a
		>. Most link back to the documents behind them, so readers can test their own questions against
		the sources.
	</p>

	<p>
		I prototype these methods in the <a
			href="https://islam.zmo.de/s/westafrica/"
			target="_blank"
			rel="noopener noreferrer"><em>Islam West Africa Collection</em> (IWAC)</a
		>, whose 30-million-word corpus tests the limits of AI in historical research <ItemReference
			id="zmo-kitchen-talks-ai-islamic-african-studies"
		/>. Working from Moretti’s (2000) “<a
			href="https://newleftreview.org/issues/ii1/articles/franco-moretti-conjectures-on-world-literature"
			target="_blank"
			rel="noopener noreferrer">distant reading</a
		>”, I treat AI as a “co-intelligence” (<a
			href="https://www.penguinrandomhouse.com/books/741805/co-intelligence-by-ethan-mollick/"
			target="_blank"
			rel="noopener noreferrer">Mollick, 2024</a
		>) for corpora too large to read in their entirety. AI-assisted sentiment analysis, for
		instance, examines how Islam and Muslims are represented in Francophone West African newspapers,
		with the results visualised in an
		<a
			href="https://iwac.frederickmadore.com/sentiment-analysis/"
			target="_blank"
			rel="noopener noreferrer">interactive dashboard</a
		>. Human judgement still decides what the patterns mean; AI offers a workable way of handling
		the volume of digital material African history now generates.
	</p>

	<RelevantGrants projectName="Digital Humanities and AI in African Studies" />
</ResearchProjectLayout>
