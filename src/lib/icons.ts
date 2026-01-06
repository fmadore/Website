/**
 * Pre-bundled icons for offline use
 * 
 * This module registers all icons at build time to avoid runtime API calls
 * to api.iconify.design, improving LCP and reducing critical path latency.
 * 
 * Icons are bundled directly into the JavaScript, eliminating network requests.
 * 
 * Note: Some newer icons (like bluesky) may not be available in bundled packages
 * and will still be fetched from the API as a fallback.
 */

import { addIcon } from '@iconify/svelte';

// MDI icons
import mdiEmail from '@iconify-icons/mdi/email';
import mdiLinkedin from '@iconify-icons/mdi/linkedin';
import mdiGithub from '@iconify-icons/mdi/github';
import mdiMapMarker from '@iconify-icons/mdi/map-marker';
import mdiRss from '@iconify-icons/mdi/rss';
import mdiChevronUp from '@iconify-icons/mdi/chevron-up';
import mdiMoonWaningCrescent from '@iconify-icons/mdi/moon-waning-crescent';
import mdiWhiteBalanceSunny from '@iconify-icons/mdi/white-balance-sunny';
import mdiMagnify from '@iconify-icons/mdi/magnify';
import mdiClose from '@iconify-icons/mdi/close';
import mdiCheckboxMarked from '@iconify-icons/mdi/checkbox-marked';
import mdiCheckboxBlankOutline from '@iconify-icons/mdi/checkbox-blank-outline';
import mdiLoading from '@iconify-icons/mdi/loading';
import mdiFilePdfBox from '@iconify-icons/mdi/file-pdf-box';
import mdiWeb from '@iconify-icons/mdi/web';

// Simple Icons (brand icons)
import simpleIconsOrcid from '@iconify-icons/simple-icons/orcid';
import simpleIconsResearchgate from '@iconify-icons/simple-icons/researchgate';

// Academicons
import academiconsGoogleScholar from '@iconify-icons/academicons/google-scholar';

// Lucide icons
import lucideFilter from '@iconify-icons/lucide/filter';
import lucideStar from '@iconify-icons/lucide/star';
import lucideCalendar from '@iconify-icons/lucide/calendar';
import lucideZoomIn from '@iconify-icons/lucide/zoom-in';
import lucideZoomOut from '@iconify-icons/lucide/zoom-out';
import lucideMaximize2 from '@iconify-icons/lucide/maximize-2';
import lucideMap from '@iconify-icons/lucide/map';

// Bluesky SVG path (bundled inline since not available in @iconify-icons packages)
// Source: Simple Icons - https://simpleicons.org/
const blueskyIcon = {
	body: '<path fill="currentColor" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565C.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479c.815 2.736 3.713 3.66 6.383 3.364c.136-.02.275-.039.415-.056c-.138.022-.276.04-.415.056c-3.912.58-7.387 2.005-2.83 7.078c5.013 5.19 6.87-1.113 7.823-4.308c.953 3.195 2.05 9.271 7.733 4.308c4.267-4.882 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056c2.67.297 5.568-.628 6.383-3.364c.246-.828.624-5.79.624-6.478c0-.69-.139-1.861-.902-2.206c-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>',
	width: 24,
	height: 24
};

/**
 * Register all icons for string-based usage.
 * Call this once at app startup (in +layout.svelte).
 */
export function registerIcons(): void {
	// MDI icons
	addIcon('mdi:email', mdiEmail);
	addIcon('mdi:linkedin', mdiLinkedin);
	addIcon('mdi:github', mdiGithub);
	addIcon('mdi:map-marker', mdiMapMarker);
	addIcon('mdi:rss', mdiRss);
	addIcon('mdi:chevron-up', mdiChevronUp);
	addIcon('mdi:moon-waning-crescent', mdiMoonWaningCrescent);
	addIcon('mdi:white-balance-sunny', mdiWhiteBalanceSunny);
	addIcon('mdi:magnify', mdiMagnify);
	addIcon('mdi:close', mdiClose);
	addIcon('mdi:checkbox-marked', mdiCheckboxMarked);
	addIcon('mdi:checkbox-blank-outline', mdiCheckboxBlankOutline);
	addIcon('mdi:loading', mdiLoading);
	addIcon('mdi:file-pdf-box', mdiFilePdfBox);
	addIcon('mdi:web', mdiWeb);

	// Simple Icons
	addIcon('simple-icons:orcid', simpleIconsOrcid);
	addIcon('simple-icons:researchgate', simpleIconsResearchgate);
	addIcon('simple-icons:bluesky', blueskyIcon);

	// Academicons
	addIcon('academicons:google-scholar', academiconsGoogleScholar);

	// Lucide icons
	addIcon('lucide:filter', lucideFilter);
	addIcon('lucide:star', lucideStar);
	addIcon('lucide:calendar', lucideCalendar);
	addIcon('lucide:zoom-in', lucideZoomIn);
	addIcon('lucide:zoom-out', lucideZoomOut);
	addIcon('lucide:maximize-2', lucideMaximize2);
	addIcon('lucide:map', lucideMap);
}

// Export individual icons for direct usage if preferred
export {
	// MDI
	mdiEmail,
	mdiLinkedin,
	mdiGithub,
	mdiMapMarker,
	mdiRss,
	mdiChevronUp,
	mdiMoonWaningCrescent,
	mdiWhiteBalanceSunny,
	mdiMagnify,
	mdiClose,
	mdiCheckboxMarked,
	mdiCheckboxBlankOutline,
	mdiLoading,
	mdiFilePdfBox,
	mdiWeb,
	// Simple Icons
	simpleIconsOrcid,
	simpleIconsResearchgate,
	blueskyIcon,
	// Academicons
	academiconsGoogleScholar,
	// Lucide
	lucideFilter,
	lucideStar,
	lucideCalendar,
	lucideZoomIn,
	lucideZoomOut,
	lucideMaximize2,
	lucideMap
};
