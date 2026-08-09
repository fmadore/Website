<script lang="ts">
	import ResearchProjectLayout from '$lib/components/research/ResearchProjectLayout.svelte';
	import { researchProject } from '$lib/data/research';
	import ItemReference from '$lib/components/reference/ItemReference.svelte';
</script>

<ResearchProjectLayout {...researchProject('digital-research-environment')}>
	<p>
		The Digital Research Environment (DRE) is the digital infrastructure unit of the <a
			href="https://www.africamultiple.uni-bayreuth.de/"
			target="_blank"
			rel="noopener noreferrer">Africa Multiple Cluster of Excellence</a
		>
		at the University of Bayreuth. We design, build, and maintain the data systems that connect researchers
		across the
		<a
			href="https://www.africamultiple.uni-bayreuth.de/en/1_1-About-Us/african-cluster-centres/index.html"
			target="_blank"
			rel="noopener noreferrer">Africa Multiple Research Centres</a
		>
		(AMRCs) and partner institutions worldwide: research data management, knowledge-graph development,
		AI-assisted processing, and digital literacy, grounded in the
		<a href="https://www.go-fair.org/fair-principles/" target="_blank" rel="noopener noreferrer"
			>FAIR</a
		>
		and
		<a href="https://www.gida-global.org/careprinciples" target="_blank" rel="noopener noreferrer"
			>CARE</a
		> principles. I joined as Data Curator in 2026.
	</p>

	<p>
		Two principles govern the work. Curation is shared: each AMRC (Ouagadougou, Makhanda, Lagos,
		Eldoret) describes the data it knows best, and the DRE runs the infrastructure that connects
		them. Storage is distributed: data remains in its local repository while Bayreuth holds the
		metadata layer pointing to it, so research data becomes findable without being relocated.
	</p>

	<p>
		That metadata layer is public as the <a
			href="https://data.africamultiple.uni-bayreuth.de/s/amira"
			target="_blank"
			rel="noopener noreferrer">Africa Multiple Interactive Research Atlas</a
		>
		(AMIRA), an Omeka S site that makes the collections searchable from one place
		<ItemReference id="reconfiguring-archive-amira-2026" />: nearly 4,000 research items, more than
		90 projects, some 1,600 people and 600 organisations, in 28 languages across 39 countries.
	</p>

	<h2>Federated description</h2>

	<p>
		The DRE works with each centre to assess what it holds and what can be linked to the platform:
		structuring and quality-checking collections, drafting data management plans, and preparing
		datasets for citation and long-term preservation.
	</p>

	<p>
		Underneath the service is a research question: whose description counts. Good metadata makes a
		researcher’s work more discoverable, but the vocabularies that carry it are rarely neutral.
		Subject terms, where they exist at all, tend to derive from Library of Congress Subject
		Headings, often poorly suited to African sources and knowledge systems. We are working towards
		taxonomies in African languages, and towards modelling the relations between entities rather
		than only tagging them, so the records become a graph one can reason over. Reconciliation with
		Wikidata would anchor those entities outward, but its African coverage is thin, which makes the
		work a contribution as much as a lookup.
	</p>

	<h2>AI-assisted processing</h2>

	<p>
		The metadata researchers supply is often thin, and subject description is almost always the
		weakest part of it. We are experimenting with AI-assisted processing as an additional service:
		OCR for print and handwriting, transcription of audio and video, summarisation, entity
		extraction, tagging and classification. The models run locally, on open-source weights and the
		Cluster’s own hardware, which keeps the pipeline GDPR-compliant for material that is often
		special-category personal data, and keeps costs down.
	</p>

	<h2>Access and dissemination</h2>

	<p>
		A collection that cannot be interrogated is not findable in any sense that matters. Alongside
		searchable databases and project websites, the DRE builds
		<a
			href="https://data.africamultiple.uni-bayreuth.de/s/amira/page/visualisations"
			target="_blank"
			rel="noopener noreferrer">dashboards, network graphs, and maps</a
		> that foreground connections: the subjects that co-occur across collections, the collaboration networks
		no single catalogue record makes visible.
	</p>

	<p>
		Users increasingly put their questions to an AI assistant instead of searching a catalogue. The <a
			href="https://github.com/AM-Digital-Research-Environment/amira-mcp-server"
			target="_blank"
			rel="noopener noreferrer">AMIRA MCP server</a
		> lets an assistant query the collection directly, so answers are drawn from the records and cite
		them, which reduces the hallucination that comes from asking a model what it already knows. Building
		and evaluating that layer is the current strand of the work.
	</p>
</ResearchProjectLayout>
