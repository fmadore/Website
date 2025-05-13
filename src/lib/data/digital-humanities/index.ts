import type { DigitalHumanitiesProject } from '$lib/types/digitalHumanities';

import { iwac } from './iwac';
import { iwacOverview } from './iwac-overview';
import { iwacWordcloud } from './iwac-wordcloud';
import { muslimUmbrellaOrganizations } from './muslim-umbrella-organizations';
import { iwacKeywords } from './iwac-keywords';
import { remoboko } from './remoboko';
import { iwacBibliographicDataWikidata } from './iwac-bibliographic-data-wikidata';
import { burkinaFasoDigitalExhibits } from './burkina-faso-digital-exhibits';
import { islamBurkinaFasoCollection } from './islam-burkina-faso-collection';

export const allDhProjects: DigitalHumanitiesProject[] = [
    iwac,
    iwacOverview,
    iwacWordcloud,
    muslimUmbrellaOrganizations,
    iwacKeywords,
    remoboko,
    iwacBibliographicDataWikidata,
    burkinaFasoDigitalExhibits,
    islamBurkinaFasoCollection
];

// Optional: Sort projects by a specific field if needed, e.g., years or title
// For now, they are in the order of definition which matches the original page approximately.

// You can also export other derived data structures if necessary, for example:
// export const projectsByYear = ...
// export const projectsBySkill = ... 