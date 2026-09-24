/**
 * The digital-humanities project summaries — the counterpart of ./index.ts for
 * the pages that list projects without opening one (the /digital-humanities
 * index, the CV). Same order as the full index. Only the project page (through
 * its server load) and the server endpoints read the full records.
 */
import type { DigitalHumanitiesSummary } from '$lib/types/digitalHumanities';
import { compareDhProjects } from './order';
import { dhProjectSummaries } from './summaries.generated';

export const allDhProjectSummaries: DigitalHumanitiesSummary[] = [...dhProjectSummaries].sort(
	compareDhProjects
);
