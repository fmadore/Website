import type { Communication } from '$lib/types/communication';

export const ecas2025Panel: Communication = {
	id: 'dh-ai-african-studies-2025',
	title:
		'Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives',
	authors: ['Frédérick Madore', 'Vincent Hiribarren'],
	date: '26 June 2025',
	dateISO: '2025-06-26',
	year: 2025,
	conference: '10th European Conference of African Studies (ECAS)',
	location: 'Prague',
	country: 'Czech Republic',
	type: 'panel',
	language: 'English',
	abstract:
		"This panel explores the transformative potential and challenges of DH and AI in African studies. It examines their impact on knowledge production and dissemination, addressing Anglocentricity and the 'digital divide', while promoting dialogue on decolonising digital practices in the field.",
	tags: ['ECAS', 'digital humanities', 'AI', 'african studies', 'decolonial'],
	image: 'images/communications/ecas-2025.webp',
	heroImage: {
		src: 'images/communications/ecas-2025-hero.webp',
		alt: 'Digital Humanities (DH) and AI in African Studies: Opportunities, Challenges, and Decolonial Perspectives'
	},
	coordinates: {
		latitude: 50.08896481219099,
		longitude: 14.416024062407818
	},
	papers: [
		{
			title:
				'Linking African Cultural Metadata for Visibility, Searchability, and Sustainability: the African Literary Metadata (ALMEDA) project',
			authors: [{ name: 'Harris Ashleigh', affiliation: 'Uppsala University' }],
			abstract:
				"The ALMEDA project is comprised of three interrelated work packages: the first investigates the history of literary metadata on the African continent in order to understand how colonial cataloguing systems came to construct the idea of the 'literary work' as book-based and thus dismissive of Africa's oral cultures. Secondly, and as a corrective to this history, ALMEDA is developing a metadata ontology specifically designed for African genres in African languages. Not only does this knowledge structure enable data entry and searchability in multiple languages, but it also involves a unique descriptive model that allows African-language genres to inhabit their own categories, rather than having to be forced into European literary ontologies. Thirdly, the project is creating a linked open metadata repository, run as a Wikibase instance, which will – when launched – be the means through which users can search for and enter data. In this presentation of the project, I aim to show some of the challenges and potentials we face in the area of African Studies when working with Linked Open Data and to present ALMEDA's emerging methods of addressing those problems. The project seeks feedback from as wide a range of stakeholders and Africanists as possible, and the paper encourages feedback on our ontology and our tentative resolutions to the challenges of addressing multilingual needs in a database of this scale."
		},
		{
			title:
				'The Islamic Cultural Archive (ICA): Enabling New Digital Modes of Knowledge Production Through Cross-Lingual Ontologies',
			authors: [
				{ name: 'Britta Frede', affiliation: 'University of Bayreuth' },
				{ name: 'Rüdiger Seesemann', affiliation: 'University of Bayreuth' }
			],
			abstract:
				'This paper presents the Islamic Cultural Archive (ICA), a database at the Africa Multiple Cluster of Excellence at the University of Bayreuth (Germany) designed to digitally enhance collaborative research on Islam in Africa in English, French and Arabic. The ICA is a digital platform to handle data through an ontology-based digital research environment building on WissKI, a set of modules that combines the Drupal content management system with semantic web technology. Connecting diverse languages and data from various digital and digitized media, the research team members generate metadata through a shared ontology to create synergies between various research foci and interests, ranging from the nexus of Islamic knowledge production, dissemination, and acquisition to the socio-religious, political-economic, and cultural dimensions of Islamic learning in Africa. There are plans to expand the thematic scope of the data collection in the future. What makes the project especially significant for decolonial methodologies and epistemologies is the joint development of cross-lingual ontologies with mainly African academic partners, enabling the ICA to reflect the relational and reflexive knowledge production involved in its creation and thus setting new standards for transcontinental and transdisciplinary research.'
		},
		{
			title:
				"Re-imagining Africa's Past in Digital Age: Using Linked Open Data to revolutionise Archive Connectivity and Accessibility",
			authors: [
				{ name: 'Jessica R. Holland', affiliation: 'British School at Athens' },
				{ name: 'David Maina', affiliation: 'British Institute of Eastern Africa' }
			],
			abstract:
				"This project will develop Linked Open Data methodologies connecting multidisciplinary archival collections for the first time, revolutionizing accessibility to materials from different regions in Africa. We will demonstrate how data from different regions is interlinked, using examples from the British Institute of Eastern Africa (BIEA) archive and the British Institute of Libya and Northern Africa Studies (BILNAS). This project's use of Linked Open Data will have an impact on knowledge production by creating an avenue where African researchers can re-interpret data collected in the colonial and postcolonial period through an indigenous lens, using Afrocentric frameworks to deconstruct and reconstruct identities which were often misrepresented by Eurocentric research in the past. For example, the portal will create an avenue where pre-colonial African trade links and exchanges within the continent and beyond can be illuminated. An early focus on the connections between Islamic architecture collections across different institutions - including those outside of Africa in the Levant and Italy, representing Roman, Byzantine and Islamic civilisations - has raised the profile of these archives and provided archivists with leverage to advocate for increased time and resources spent on improving metadata and digitising these collections. We are demonstrating the potential of these methods through digital storytelling and map-based data visualizations, showing how Linked Open Data can facilitate answers to new and complex research questions. We will also comment on the limitations of the Anglocentric collection descriptions, and of reinterpretation of the materials when they remain under the control of organisations in the Global North."
		},
		{
			title:
				'Preserving African Literature: Digital Pathways for Contextual Interpretation and Epistemic Frameworks',
			authors: [{ name: 'Augustine A. Farinola', affiliation: 'University of Alberta' }],
			abstract:
				"In a world where digital platforms increasingly shape access to global knowledge, African literary works often remain underrepresented or misunderstood due to the lack of context around their linguistic, cultural, and philosophical foundations. Africanpedia is a comprehensive digital archive that seeks to address this gap by preserving and presenting African literature within its unique epistemic and cultural frameworks. The project is rooted in the belief that African literary heritage can only be fully appreciated through a lens that respects its multilingualism, historical depth, and the philosophical traditions it embodies. African literary works have long been shaped by both native and colonial influences. Many African authors write in colonial languages like English, French, or Portuguese, but their work is deeply informed by African languages, epistemologies, and histories. Africanpedia offers a structured platform that allows scholars and readers to explore these interwoven dynamics, revealing the rich cultural and political backgrounds that shape the literary output of African writers. The platform's goal is to provide users with a contextualized experience of African literature. It features detailed historical accounts of African empires and communities, multilingual perspectives on African texts, and tools for understanding the epistemic frameworks embedded within the works. By fostering a deeper understanding of the sociopolitical and linguistic elements of African literature, its users to engage with these texts on a more meaningful level. It's designed not only for scholars but also for general readers interested in African culture."
		},
		{
			title: 'Taking the ESCALATOR from Humanities to Digital Humanities',
			authors: [
				{
					name: 'Menno van Zaanen',
					affiliation: 'South African Centre for Digital Language Resources'
				},
				{
					name: 'Jessica Mabaso',
					affiliation: 'South African Centre for Digital Language Resources'
				}
			],
			abstract:
				'The South African Centre for Digital Language Resources (SADiLaR) is a research infrastructure that, among others, aims to build research capacity in Digital Humanities across South Africa. While SADiLaR has successfully conducted training activities to familiarize participants with Digital Humanities tools, these efforts in the past have been ad hoc, lacking both follow-up support and dedicated channels for on-going assistance. The ESCALATOR project was conceived to address these limitations. Following a needs assessment that identified demand for a Digital Humanities community of practice, the project implements several strategic initiatives. Training activities have been restructured into a progressive curriculum designed to develop champions who can provide direct support to researchers at their respective universities. A Slack platform has been established to facilitate information sharing about funding opportunities and events, while also serving as a forum for questions and answers. The project organizes regional DH-IGNITE in-person events to foster networking and showcase research possibilities across universities. Additionally, a stakeholder mapping tool enables researchers to position themselves within the broader Digital Humanities landscape, facilitating collaboration among scholars working on similar topics. These coordinated efforts create a model that may benefit others seeking to develop similar communities of practice in Digital Humanities.'
		},
		{
			title:
				"AI-Powered Analysis of Arabic Manuscripts: Accelerating Access to Sudan's Endangered Archives",
			authors: [{ name: 'Albrecht Hofheinz', affiliation: 'University of Oslo' }],
			abstract:
				"Sudan's public and private archives face existential threats from ongoing civil war, risking the loss of historical sources before their voices can challenge dominant narratives still shaped by colonial accounts and the weight of metropolitan perspectives in the Global North. The Sudan Collection at the University of Bergen, containing copies of approximately 5000 documents from Sudanese archives, has become increasingly vital given the precarious state of the originals, particularly land documents that may inform post-war settlements. The Universities of Bergen, Oslo, and Khartoum are collaborating to digitize and catalogue this collection for UNESCO World Heritage List nomination. While digitization provides unprecedented access, traditional textual scholarship struggles to keep pace, and Arabic HTR (handwritten text recognition) remains limited by extensive pre-training requirements. This paper presents an innovative method to unlock large Arabic manuscript collections using Google's Document AI, accessed through a simple programming interface. Despite imperfect HTR output, this tool, combined with large language models, enables effective automated content analysis and summarization. By reducing the time required to identify materials warranting detailed examination, this workflow frees valuable resources for in-depth textual analysis. This methodology has been validated by comparing results against conventionally studied samples. The presentation will demonstrate both the technical workflow and its application to a unique corpus of 600+ manuscript pages from 18th-20th century Sudan in the Bergen collection. This approach not only expedites research but also amplifies local voices preserved within these manuscripts, contributing to a more inclusive and representative understanding of Sudanese history."
		},
		{
			title: 'Lagos Life: Rethinking DH in Historical Approaches to African Cities',
			authors: [{ name: 'Ademide Adelusi-Adeluyi', affiliation: 'Howard University' }],
			abstract:
				'In 1868 an English-speaking Yoruba clerk named the new and old streets in Lagos. This list of nearly 100 names stretched across the inhabited parts of Lagos Island, collecting history, politics, and individuals (both freed and enslaved). By harnessing the past and present in place, this spatial project forged a cultural context for representing Lagos\'s landscape, connecting the city with the diaspora, the land with the lagoon, freedom with slavery, and fixed Lagosians within the conflict between new and old beliefs. "Lagos Life" analyzes and maps this data using DH tools, which in turn allows both community and academic audiences to engage with this past. However, as digital projects like this continue to grow in popularity and potential, traditional concerns around evidence and argumentation linger. Despite their advantages, DH tools that support data analysis, mapmaking and presentation still bring up problems about sources, methods, and highlighting non-elite voices, especially women. Some of these concerns are very old, such as the consequences of using European sources to write West African histories. This project engages with the possibilities and pitfalls of this method. By reading the city as an archive of its own history – alongside colonial documents, maps,  and transcribed oral narratives – "Lagos Life" explores the histories of Lagos\'s streets as markers of the moments of placemaking, identity, freedom, and displacement in the nineteenth century. This analysis features maps and new datasets that make this past accessible, while also considering data ethics, and the methodological challenges of doing this work.'
		},
		{
			title: 'Data Riddles: Mapping Senufo as a Case Study',
			authors: [{ name: 'Susan Elizabeth Gagliardi', affiliation: 'Emory University' }],
			abstract:
				"Mapping Senufo: Art, Evidence, and the Production of Knowledge—a collaborative, iterative, born-digital publication project—focuses on arts recognized as Senufo, one of the most celebrated and documented styles of so-called historical, traditional, or classical arts of Africa since the early twentieth century. Senufo also names a language family and a cultural or ethnic group spanning the borders of present-day Burkina Faso, Côte d'Ivoire, and Mali. Recent generations of local knowledge experts in this region report transmission of insights through riddles that invite each learner to arrive at their own conclusions based on careful observation, reflection, and experimentation. This form of knowledge dissemination encourages slow thinking and processing of information that the digital realm tends to thwart through its promise of fast facts accessible in an instant to anyone with a data connection. For instance, when they consult museum websites, users might assume the details presented to them rest on solid evidence. However, available data often constitute riddles more than indisputable details. In this presentation, Susan Elizabeth Gagliardi draws on her work with the Mapping Senufo project team to demonstrate possibilities for slowing down engagement in the digital realm and recuperating processes of observation, reflection, and experimentation. She reflects on what the project team has learned along the way and examines possible next steps."
		},
		{
			title: 'Historian vs AI: who reads and analyses archives best?',
			authors: [
				{ name: 'Vincent Hiribarren', affiliation: "King's College London" },
				{ name: 'Frédérick Madore', affiliation: 'Leibniz-Zentrum Moderner Orient' }
			],
			abstract:
				'This paper compares how a historian and AI approach the reading and analysis of archival content in early 2025. The experiment focuses on a selection of documents housed at the National Archives of the United Kingdom, specifically related to the war in Cameroon during the late 1950s and early 1960s. These documents were chosen because I have previously published historical research based on their content. The primary goal is to assess the accuracy of AI in two key areas: (a) summarizing the content of digitized documents and (b) answering specific historical questions derived from these records.'
		},
		{
			title:
				'The Geopolitics of Academic Knowledge. How to fight cultural standardization in the era of publishing monopolies and digital platforms',
			authors: [
				{ name: 'Domenico Fiormonte', affiliation: 'University of Roma Tre' },
				{ name: 'Janeth David Nzenga', affiliation: 'Ardhi University' }
			],
			abstract:
				'According to a Canadian research (Larivière 2015), Reed-Elsevier, Taylor & Francis and Wiley-Blackwell represent 47% of all published papers in 2013, and the five top publishers represent 53%. This knowledge bias is aggravated by the control exerted by the two platforms used to evaluate research at global level: Scopus (owned by Elsevier) and Web of Science (owned by Thomson Reuters). This hegemony constitutes not only a geopolitical and economic problem, but it completely distorts the representation of science in favor of Western (and especially Anglophone) countries. In fact, the academic publishing monopolies system not only jeopardize diversity in science, but put at risk entire languages, cultures and territories. We know that local knowledge has a strategic value, and it is necessary for the development and growth of a country. Knowledge production is therefore a problem of cultural sovereignty and epistemic justice that needs to be addressed by any higher educational system that wants to remain healthy and independent. In our talk we will ilustrate some decolonization strategies based on two main strategies: 1) the introduction of different criteria and metrics for the evaluation of locally produced research; 2) the creation of an Open Access infrastructure for academic content (books, journals, theses, etc.) produced within each country or different associated territories.'
		}
	],
	project: 'Mining the Islam West Africa Collection'
};
