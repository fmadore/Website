import type {
	DigitalHumanitiesProject,
	ProjectLink,
	ProjectLinkType
} from '#lib/types/digitalHumanities.ts';
import { formatDisplayUrl } from '#lib/utils/textUtils.ts';

export interface ProjectLinkGroup {
	type: ProjectLinkType;
	/** Mono key printed before the addresses of this kind. */
	key: string;
	links: ProjectLink[];
}

/** Display order; also the keys the CV and project pages print. */
const LINK_KEYS: readonly { type: ProjectLinkType; key: string }[] = [
	{ type: 'site', key: 'Site' },
	{ type: 'install', key: 'Install' },
	{ type: 'code', key: 'Code' },
	{ type: 'data', key: 'Data' }
] as const;

/** Groups a project's public addresses by kind, dropping empty groups. */
export function groupProjectLinks(
	project: Pick<DigitalHumanitiesProject, 'links'>
): ProjectLinkGroup[] {
	const all: ProjectLink[] = project.links ?? [];

	return LINK_KEYS.map(({ type, key }) => ({
		type,
		key,
		links: all.filter((link) => (link.type ?? 'site') === type)
	})).filter((group) => group.links.length > 0);
}

/**
 * What to print for a link: its explicit label, or the bare address — which is
 * what a CV should show, and what a reader can copy off a printed page.
 */
/** A project's addresses of one kind, in record order. */
export function projectLinksOfType(
	project: Pick<DigitalHumanitiesProject, 'links'>,
	type: ProjectLinkType
): ProjectLink[] {
	return (project.links ?? []).filter((link) => (link.type ?? 'site') === type);
}

export function projectLinkText(link: ProjectLink): string {
	return link.label ?? formatDisplayUrl(link.url);
}
