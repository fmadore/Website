import type { Activity } from '$lib/types';
import { formatDisplayDate } from '$lib/utils/date-formatter';

export const activity: Activity = {
	id: 'ecas-panel-report',
	title: 'Report of the ECAS Panel "Digital Humanities and AI in African Studies"',
	dateISO: '2025-06-26',
	date: formatDisplayDate('2025-06-26'),
	year: 2025,
	description: 'Summary report of the ECAS 2025 panel on Digital Humanities and AI in African Studies.',
	content: `
        <p>This double panel, organised in collaboration with Vincent Hiribarren (King's College London) at the 10th European Conference of African Studies (ECAS) in Prague, brought together eight innovative projects demonstrating how digital humanities (DH) and artificial intelligence (AI) are reshaping African studies. The presentations illuminated both the transformative potential and significant challenges of using digital tools to decolonise knowledge production about Africa.

## Reimagining Archives and Metadata

Three pioneering projects are revolutionising how African cultural materials are catalogued and interpreted. The African Literary Metadata (ALMEDA) project, led by Ashleigh Harris at Uppsala University, directly confronts colonial cataloguing systems that have marginalised African oral cultures. ALMEDA develops metadata ontologies tailored to African language genres, creating a multilingual, open, linked data repository where users can search and input data in multiple African languages. This approach liberates African literary forms from European classification systems, allowing them to exist within their own conceptual frameworks.

The *Islamic Cultural Archive* (Britta Frede and Rüdiger Seesemann, University of Bayreuth) complements this work by establishing a trilingual collaborative research platform for Islamic studies in Africa, spanning English, French, and Arabic. Through cross-lingual ontologies developed with African academic partners, the project establishes new standards for transcontinental research grounded in collaborative knowledge creation.

Taking a distinctive approach, the *Mapping Senufo* project (Susan Elizabeth Gagliardi, Emory University) investigates arts from Burkina Faso, Côte d'Ivoire, and Mali through a born-digital publication that resists the digital realm's tendency towards rapid consumption. Drawing inspiration from indigenous knowledge transmission through riddles, the project promotes contemplative engagement with museum data, encouraging critical scrutiny of information that often misrepresents ambiguities as certainties.

## Building Infrastructure and Communities

Two groundbreaking projects are constructing sustainable DH ecosystems that transform research infrastructure across Africa. The ESCALATOR project, led by the South African Centre for Digital Language Resources (SADiLaR), addresses the fragmentation of DH training through comprehensive support structures. These include a progressive curriculum cultivating local DH champions, a Slack platform fostering community engagement, regional DH-IGNITE networking events, and a stakeholder mapping tool facilitating inter-institutional collaboration. This structured approach eschews sporadic workshops in favour of establishing self-sustaining communities of practice across South African universities.

Jessica Holland (British School at Athens) and David Maina (British Institute of Eastern Africa) have developed a Linked Open Data project that revolutionises archival accessibility. Their work connects multidisciplinary collections across Africa for the first time, revealing relationships between institutions such as the British Institute of Eastern Africa and the British Institute of Libya and Northern Africa Studies. This methodology empowers African researchers to reinterpret colonial and postcolonial materials through indigenous frameworks. Digital storytelling and map-based visualisations illuminate pre-colonial African trade networks and cross-cultural exchanges often obscured by colonial archives.

## AI as Research Tool: Promises and Limitations

Two contrasting presentations illuminate AI's transformative potential and inherent constraints in African historical research. Albrecht Hofheinz (University of Oslo) demonstrates how AI accelerates access to endangered historical sources in Sudan. Using Google's Document AI, he has processed 5,000 Arabic manuscripts from the Sudan Collection at Bergen—materials gaining urgency as civil war threatens. Though handwritten text recognition remains imperfect, this workflow, enhanced by large language models, enables rapid content analysis and summarisation. Researchers can thus concentrate on detailed textual analysis whilst amplifying local voices that might otherwise remain unheard.

Vincent Hiribarren and Frédérick Madore's comparative study directly tests AI's analytical capabilities against human expertise. Examining British Colonial Office files on the Cameroon War alongside the vast *Islam West Africa Collection* (24 million words), their findings reveal a crucial paradox: whilst AI excels at identifying patterns across large corpora, it perpetuates the colonial perspectives embedded in source materials.

Both projects converge on a collaborative model where AI handles routine, corpus-wide tasks—from OCR repair to entity tagging—whilst historians remain essential for crafting prompts, auditing outputs, and ensuring interpretations challenge rather than reproduce colonial perspectives. This synthesis demonstrates that AI's value lies not in replacing human analysis but in enabling large-scale archival engagement—engagement that demands vigilance against technology's tendency to amplify historical documentation's existing biases.

## Key Challenges and Critical Insights

The Q&A sessions crystallised four principal challenges confronting DH in African studies. First, fundamental gaps in digital literacy and infrastructure perpetuate dependency on Global North expertise, constraining local capacity development. Second, genuine decolonisation transcends multilingual interfaces; it requires interrogating whether knowledge structures organised through colonial languages inevitably reproduce imperial frameworks. Third, as AI tools grow more sophisticated, the "black box" problem threatens to create new forms of mystified authority. Researchers must therefore document their prompts, models, and parameters rigorously. Finally, AI's formidable processing power risks overwhelming human critical judgement, making analytical perspective essential even as we harness computational capabilities.

## Conclusions

The presentations converged on core principles for ethical digital practice. Successful projects balance investment in human networks with technical systems to ensure sustainable communities. Researchers require new competencies spanning prompt engineering, ethical AI deployment, and critical algorithm interpretation.

The panel exposed a fundamental tension: whilst DH and AI offer unprecedented opportunities to recover marginalised voices and empower African communities to shape their narratives, they simultaneously risk reproducing colonial extraction and classification on a digital scale. The digital transformation of African studies thus represents not merely a technical challenge but an inherently political project.

Success demands radical metric shifts. Rather than celebrating technological sophistication, we must measure our tools' effectiveness in fostering more just and inclusive understandings of African histories and cultures. Progress requires collaborative development, sustained critical engagement with technology, and unwavering commitment to building equitable knowledge infrastructures—infrastructures that serve African communities rather than extract from them.</p>
    `,
	tags: ['ECAS', 'Digital Humanities', 'AI', 'African Studies'],
	image: '',
	panelType: 'conference',
	heroImage: {
		src: 'images/activities/ECAS-2025.webp',
		alt: 'ECAS 2025 logo with the theme “African, Afropean, Afropolitan,” held in Prague, June 25-28, 2025.',
		caption: ''
	}
};
