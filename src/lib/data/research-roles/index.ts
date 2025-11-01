import type { ResearchRole } from '$lib/types/researchRole';
import {
	wanaProjectRepresentative,
	ciramCoordinator,
	sshrcResearchAssistant2016,
	giersaResearchAssistant,
	uqamResearchAssistant
} from './researchRoles';

const allResearchRoles: ResearchRole[] = [
	wanaProjectRepresentative,
	ciramCoordinator,
	sshrcResearchAssistant2016,
	giersaResearchAssistant,
	uqamResearchAssistant
];

// Sort by start year (most recent first)
export const researchRolesByDate = [...allResearchRoles].sort((a, b) => {
	return b.startYear - a.startYear;
});
