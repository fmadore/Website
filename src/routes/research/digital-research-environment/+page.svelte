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
		(AMRCs) and partner institutions worldwide. The work spans research data management, knowledge-graph
		development, AI-assisted data processing, and digital literacy, all grounded in the
		<a href="https://www.go-fair.org/fair-principles/" target="_blank" rel="noopener noreferrer"
			>FAIR</a
		>
		and
		<a href="https://www.gida-global.org/careprinciples" target="_blank" rel="noopener noreferrer"
			>CARE</a
		> principles and a commitment to multiple knowledge systems. I joined as Data Curator in 2026.
	</p>

	<p>
		Two principles guide how we work. Curation and description are a joint effort with partners at
		the AMRCs in Ouagadougou, Makhanda, Lagos, and Eldoret: each centre describes the data it knows
		best, and the DRE runs the shared infrastructure that connects them. Storage, in turn, stays
		distributed by default. Data remains in its local repository, while Bayreuth holds the metadata
		layer that points to it, so research data becomes findable without being relocated. Both
		commitments are design constraints as much as principles, and much of what follows is an account
		of what they cost and what they make possible.
	</p>

	<p>
		All of this metadata comes together in the <a
			href="https://data.africamultiple.uni-bayreuth.de/s/amira"
			target="_blank"
			rel="noopener noreferrer">Africa Multiple Interactive Research Atlas</a
		>
		(AMIRA), an Omeka S site that makes the collections of the AMRCs and their partners searchable from
		one place <ItemReference id="reconfiguring-archive-amira-2026" />. It is the visible layer of
		the team's work, and the testbed for most of the questions below: nearly 4,000 research items,
		more than 90 projects, some 1,600 people and 600 organisations, in 28 languages across 42
		countries.
	</p>

	<h2>Describing data across five centres</h2>

	<p>
		Federated description is the premise the rest depends on. The AMRCs and partner institutions
		hold substantial research collections and datasets; the DRE works with each centre to assess the
		scope, nature, quality, and size of that data, and to determine what can be linked to the
		platform. In practice this means structuring, describing, and quality-checking collections so
		they stay findable and reusable; running consultations with projects from the start, so data
		management plans are drafted while decisions are still cheap to change; and preparing datasets
		for deposit with DOIs and long-term archival.
	</p>

	<p>
		The research question underneath the service is whose description counts. High-quality metadata
		makes a researcher's data more discoverable and their work more visible to a wider community of
		peers, but the vocabularies that carry it are rarely neutral. Subject description most of all:
		where terms exist at all, they tend to derive from Library of Congress Subject Headings, a
		vocabulary poorly suited to African sources and knowledge systems. Building taxonomies in
		African languages, and mapping project vocabularies onto them rather than onto an inherited
		standard, is where the Cluster's commitment to multiple knowledge systems becomes a concrete
		modelling problem instead of a statement of intent.
	</p>

	<h2>Modelling African knowledge</h2>

	<p>
		Tagging entities is where most collections stop. The harder step is to model the relations
		between them, so that a set of records becomes a graph one can reason over: people linked to
		projects, projects to places, places to the subjects that recur across them. Reconciliation with
		Wikidata anchors those entities outward, but its African coverage is thin, which turns the work
		into a contribution rather than a lookup. Where no record exists, the entity has to be created.
	</p>

	<p>
		Two problems make this more than a data-entry exercise. The first is accuracy: generic models
		systematically misfire on African persons and places, mistaking variant spellings, honorifics,
		and non-European name ordering, and an entity-linking pipeline is only as good as its
		disambiguation on exactly the cases the training data underrepresents. The second is coverage.
		Alongside the research-item metadata, the Cluster's own scholarship is a corpus no one has yet
		read computationally: extracting entities, places, and themes from the full texts, and modelling
		the relations among them, produces a map of what Africa Multiple's research actually covers, and
		what it overlooks.
	</p>

	<h2>AI-assisted processing</h2>

	<p>
		Researchers return from fieldwork with hundreds or thousands of scans, photographs, and
		recordings, and the material often stays unprocessed for years. AI-assisted processing is what
		makes that backlog tractable: OCR for printed documents and handwriting, transcription of audio
		and video, summarisation of large corpora, named-entity extraction, and automatic tagging and
		classification of digital collections.
	</p>

	<p>
		Two constraints shape how we build it. The models run locally, on open-source weights and the
		Cluster's own hardware, which keeps the pipeline GDPR-compliant for material that is frequently
		special-category personal data, and keeps it affordable for centres that cannot absorb
		commercial API costs. And every machine-generated value carries its provenance: the model that
		produced it, when, and the fact that a machine produced it at all. Where traditional OCR
		announces failure through obvious garbling, LLM-based processing hides fabrication and silent
		normalisation behind clean text. Recorded provenance and human validation are what keep that
		trade honest.
	</p>

	<h2>Access, visualisation, and dissemination</h2>

	<p>
		A collection that cannot be interrogated is not findable in any sense that matters. Alongside
		searchable, public-facing collection databases and project websites, the DRE builds interactive
		dashboards, network graphs, and maps that make research data explorable rather than merely
		retrievable. AMIRA's own visualisations follow the atlas's premise: rather than discrete
		records, they foreground connections, clustering the subjects that co-occur across the
		collections and drawing the collaboration networks that no single catalogue record makes
		visible.
	</p>

	<p>
		How scholars arrive is changing too. A growing share now ask an AI assistant a question in their
		own language rather than searching a catalogue with keywords and facets, while automated
		crawlers harvest open collections in volumes heavy enough to take the serving infrastructure
		offline. The institution that assembled and described the data is then neither cited nor
		represented well in what the models say about its subject. Between closing a collection off and
		leaving it to unrestricted extraction lies a mediated layer, in which the institution defines
		how a machine may query its holdings, the data stays on its own servers, and every answer
		carries a link back to its source. Building and evaluating that layer for AMIRA is the current
		strand of this work.
	</p>
</ResearchProjectLayout>
