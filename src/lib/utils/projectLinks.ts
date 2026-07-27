import type {
	DigitalHumanitiesProject,
	ProjectLink,
	ProjectLinkType
} from '$lib/types/digitalHumanities';
import { formatDisplayUrl } from '$lib/utils/textUtils';

export interface ProjectLinkGroup {
	type: ProjectLinkType;
	/** Mono key printed before the addresses of this kind. */
	key: string;
	links: ProjectLink[];
}

/** Display order; also the keys the CV and project pages print. */
const LINK_KEYS: readonly { type: ProjectLinkType; key: string }[] = [
	{ type: 'site', key: 'Site' },
	{ type: 'code', key: 'Code' },
	{ type: 'data', key: 'Data' }
] as const;

/**
 * Groups a project's public addresses by kind, dropping empty groups.
 *
 * `linkUrl` is folded in as a site: a project that redirects its card
 * externally should still list that address alongside the rest.
 */
export function groupProjectLinks(
	project: Pick<DigitalHumanitiesProject, 'linkUrl' | 'links'>
): ProjectLinkGroup[] {
	const all: ProjectLink[] = [
		...(project.linkUrl ? [{ url: project.linkUrl, type: 'site' as const }] : []),
		...(project.links ?? [])
	];

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
export function projectLinkText(link: ProjectLink): string {
	return link.label ?? formatDisplayUrl(link.url);
}
